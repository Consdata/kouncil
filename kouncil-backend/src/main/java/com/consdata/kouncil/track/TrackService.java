package com.consdata.kouncil.track;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.MessagesHelper;
import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.topic.TopicMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackService {

    private final KafkaConnectionService kafkaConnectionService;
    private final DeserializationService deserializationService;
    private final EventMatcher eventMatcher;
    private final MessagesHelper messagesHelper;

    public List<TopicMessage> getEvents(List<String> topicNames, String field, String operatorParam, String value, Long beginningTimestampMillis, Long endTimestampMillis, String serverId, TrackStrategy trackStrategy) {
        log.debug("TRACK01 topicNames={}, field={}, operator={}, value={}, beginningTimestampMillis={}, endTimestampMillis={}, serverId={}",
                topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId);
        TrackOperator trackOperator = TrackOperator.fromValue(operatorParam);
        messagesHelper.validateTopics(serverId, topicNames);
        try (KafkaConsumer<Bytes, Bytes> consumer = kafkaConnectionService.getKafkaConsumer(serverId, 5000)) {
            List<TopicMetadata> metadataList = prepareMetadata(topicNames, beginningTimestampMillis, endTimestampMillis, consumer);
            metadataList.sort(Comparator.comparing(TopicMetadata::getAllPartitionRangeSize));
            log.debug("TRACK20 metadata={}", metadataList);

            for (TopicMetadata m : metadataList) {
                Boolean[] exhausted = positionConsumer(consumer, m);
                long startTime = System.nanoTime();
                int emptyPolls = 0;
                while (emptyPolls < 5 && Arrays.stream(exhausted).anyMatch(x -> !x)) {
                    if (trackStrategy.shouldStopTracking()) {
                        return trackStrategy.processFinalResult();
                    }
                    List<TopicMessage> candidates = new ArrayList<>();
                    ConsumerRecords<Bytes, Bytes> records = consumer.poll(Duration.ofMillis(100L * (emptyPolls + 1)));
                    if (records.isEmpty()) {
                        emptyPolls++;
                    } else {
                        emptyPolls = 0;
                    }
                    log.debug("TRACK70 topic={} poll took={}ms, returned {} records", m.getTopicName(), (System.nanoTime() - startTime) / 1000000, records.count());
                    for (ConsumerRecord<Bytes, Bytes> consumerRecord : records) {
                        if (consumerRecord.offset() >= m.getEndOffsets().get(consumerRecord.partition())) {
                            if (Boolean.FALSE.equals(exhausted[consumerRecord.partition()])) {
                                log.debug("TRACK24 topic={}, partition={} exhausted", m.getTopicName(), consumerRecord.partition());
                                exhausted[consumerRecord.partition()] = true;
                            }
                            continue;
                        }
                        DeserializedMessage deserializedMessage = deserializationService.deserialize(serverId, consumerRecord);
                        if (eventMatcher.filterMatch(field, trackOperator, value, consumerRecord.headers(), deserializedMessage.getValueData().getDeserialized())) {
                            candidates.add(TopicMessage
                                    .builder()
                                    .topic(m.getTopicName())
                                    .key(deserializedMessage.getKeyData().getDeserialized())
                                    .keyFormat(deserializedMessage.getKeyData().getMessageFormat())
                                    .value(deserializedMessage.getValueData().getDeserialized())
                                    .valueFormat(deserializedMessage.getValueData().getMessageFormat())
                                    .offset(consumerRecord.offset())
                                    .partition(consumerRecord.partition())
                                    .timestamp(consumerRecord.timestamp())
                                    .headers(messagesHelper.mapHeaders(consumerRecord.headers()))
                                    .build());
                        }
                    }
                    log.debug("TRACK90 topic={}, poll completed candidates.size={}", m.getTopicName(), candidates.size());
                    trackStrategy.processCandidates(candidates);
                }
            }

            return trackStrategy.processFinalResult();
        }
    }

    private Boolean[] positionConsumer(KafkaConsumer<Bytes, Bytes> consumer, TopicMetadata m) {
        consumer.assign(m.getPartitions().values());
        Boolean[] exhausted = new Boolean[m.getPartitions().size()];
        Arrays.fill(exhausted, Boolean.FALSE);
        for (Map.Entry<Integer, TopicPartition> entry : m.getPartitions().entrySet()) {
            Integer partitionIndex = entry.getKey();
            Long startOffsetForPartition = m.getBeginningOffsets().get(partitionIndex);
            log.debug("TRACK50 topic={}, partition={}, startOffsetForPartition={}", m.getTopicName(), partitionIndex, startOffsetForPartition);
            if (startOffsetForPartition < 0) {
                log.debug("TRACK51 topic={}, partition={} startOffsetForPartition is -1, seekToEnd", m.getTopicName(), partitionIndex);
                consumer.seekToEnd(Collections.singletonList(m.getPartitions().get(partitionIndex)));
                exhausted[partitionIndex] = true;
            } else {
                log.debug("TRACK52 topic={}, partition={}, startOffsetForPartition={}", m.getTopicName(), partitionIndex, startOffsetForPartition);
                consumer.seek(m.getPartitions().get(partitionIndex), startOffsetForPartition);
            }
        }
        return exhausted;
    }

    private List<TopicMetadata> prepareMetadata(List<String> topicNames, Long beginningTimestampMillis, Long endTimestampMillis, KafkaConsumer<Bytes, Bytes> consumer) {
        List<TopicMetadata> metadataList = new ArrayList<>();
        for (String t : topicNames) {
            Map<Integer, TopicPartition> partitions = IntStream.rangeClosed(0, consumer.partitionsFor(t).size() - 1).boxed().collect(Collectors.toMap(Function.identity(), p -> new TopicPartition(t, p)));

            consumer.assign(partitions.values());

            Map<Integer, Long> beginningOffsets = messagesHelper.calculateBeginningOffsets(beginningTimestampMillis, null, consumer, partitions.values());
            Map<Integer, Long> endOffsets = messagesHelper.calculateEndOffsets(endTimestampMillis, null, consumer, partitions.values());
            metadataList.add(TopicMetadata.builder()
                    .topicName(t)
                    .partitions(partitions)
                    .beginningOffsets(beginningOffsets)
                    .endOffsets(endOffsets)
                    .build());
        }
        return metadataList;
    }
}
