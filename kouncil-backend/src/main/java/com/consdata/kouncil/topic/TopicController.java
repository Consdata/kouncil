package com.consdata.kouncil.topic;

import com.consdata.kouncil.AbstractMessagesController;
import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.logging.EntryExitLogger;
import com.consdata.kouncil.serde.SerdeService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
import com.consdata.kouncil.track.TopicMetadata;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@RestController
@SuppressWarnings("java:S6212") //val
public class TopicController extends AbstractMessagesController {

    public TopicController(KafkaConnectionService kafkaConnectionService,
                           SerdeService serdeService) {
        super(kafkaConnectionService, serdeService);
    }

    @GetMapping("/api/topic/messages/{topicName}/{partition}")
    public TopicMessagesDto getTopicMessages(@PathVariable("topicName") String topicName,
                                             @PathVariable("partition") String partitions,
                                             @RequestParam("page") String pageParam,
                                             @RequestParam("limit") String limitParam,
                                             @RequestParam(value = "beginningTimestampMillis", required = false) Long beginningTimestampMillis,
                                             @RequestParam(value = "endTimestampMillis", required = false) Long endTimestampMillis,
                                             @RequestParam(value = "offset", required = false) Long offset,
                                             @RequestParam("serverId") String serverId) {
        log.debug("TCM01 topicName={}, partitions={}, pageParam={}, limit={}, beginningTimestampMillis={}, endTimestampMillis={}",
                topicName, partitions, pageParam, limitParam, beginningTimestampMillis, endTimestampMillis);
        validateTopics(serverId, Collections.singletonList(topicName));
        int limit = Integer.parseInt(limitParam); // per partition!
        long page = Long.parseLong(pageParam); // per partition!
        try (KafkaConsumer<Bytes, Bytes> consumer = kafkaConnectionService.getKafkaConsumer(serverId, limit)) {
            TopicMetadata metadata = prepareMetadata(topicName, partitions, beginningTimestampMillis, endTimestampMillis, offset, consumer);
            log.debug("TCM20 metadata={}", metadata);

            List<TopicMessage> messages = new ArrayList<>();
            for (Map.Entry<Integer, TopicPartition> entry : metadata.getPartitions().entrySet()) {

                Integer partitionIndex = entry.getKey();
                TopicPartition partition = entry.getValue();
                consumer.assign(Collections.singletonList(partition));

                Long startOffsetForPartition = metadata.getBeginningOffsets().get(partitionIndex);
                Long endOffsetForPartition = metadata.getEndOffsets().get(partitionIndex);
                log.debug("TCM50 partition={}, startOffsetForPartition={}, endOffsetForPartition={}", partitionIndex, startOffsetForPartition, endOffsetForPartition);
                if (startOffsetForPartition < 0) {
                    log.debug("TCM51 startOffsetForPartition is -1, seekToEnd");
                    consumer.seekToEnd(Collections.singletonList(partition));
                    continue;
                }

                if (metadata.getPartitionRangeSize(partitionIndex) == 0) {
                    log.debug("TCM52 no new messages");
                    continue;
                }

                long position = endOffsetForPartition - limit * (page - 1);
                log.debug("TCM60 partition={}, position={}", partitionIndex, position);
                long seekTo = position - limit;
                if (seekTo > startOffsetForPartition) {
                    log.debug("TCM61 partition={}, seekTo={}", partitionIndex, seekTo);
                    consumer.seek(partition, seekTo);
                } else {
                    log.debug("TCM62 partition={}, seekTo startOffset={}", partitionIndex, startOffsetForPartition);
                    consumer.seek(partition, startOffsetForPartition);
                }
                pollMessages(serverId, limit, consumer, metadata.getEndOffsets(), messages);
            }

            log.debug("TCM90 poll completed records.size={}", messages.size());
            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));

            long totalResult = metadata.getEndOffsets().keySet().stream().map(index -> metadata.getEndOffsets().get(index) - metadata.getBeginningOffsets().get(index)).reduce(0L, Long::max);
            TopicMessagesDto topicMessagesDto = TopicMessagesDto.builder()
                    .messages(messages)
                    .partitionOffsets(metadata.getBeginningOffsets())
                    .partitionEndOffsets(metadata.getEndOffsets())
                    .totalResults(totalResult)
                    .build();
            log.debug("TCM99 topicName={}, partition={}, page={} topicMessages.size={}, totalResult={}", topicName, partitions, page, topicMessagesDto.getMessages().size(), totalResult);
            return topicMessagesDto;
        }
    }

    private TopicMetadata prepareMetadata(
            String topicName,
            String partitions,
            Long beginningTimestampMillis,
            Long endTimestampMillis,
            Long offset,
            KafkaConsumer<Bytes, Bytes> consumer) {
        Map<Integer, TopicPartition> partitionMap;
        Collector<Integer, ?, Map<Integer, TopicPartition>> integerMapCollector = Collectors.toMap(Function.identity(), p -> new TopicPartition(topicName, p));
        if (partitions.equalsIgnoreCase("all")) {
            List<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
            partitionMap = IntStream.rangeClosed(0, partitionInfos.size() - 1)
                    .boxed()
                    .collect(integerMapCollector);
        } else {
            partitionMap = Arrays.stream(partitions.split(","))
                    .mapToInt(Integer::parseInt)
                    .boxed()
                    .collect(integerMapCollector);
        }

        consumer.assign(partitionMap.values());

        Map<Integer, Long> beginningOffsets = calculateBeginningOffsets(beginningTimestampMillis, offset, consumer, partitionMap.values());
        Map<Integer, Long> endOffsets = calculateEndOffsets(endTimestampMillis, offset, consumer, partitionMap.values());
        return TopicMetadata.builder()
                .topicName(topicName)
                .partitions(partitionMap)
                .beginningOffsets(beginningOffsets)
                .endOffsets(endOffsets)
                .build();
    }

    /**
     * Sometimes poll after seek returns none or few results.
     * So we try to call it until we receive two consecutive empty polls or have enught messages
     */
    private void pollMessages(String clusterId, int limit, KafkaConsumer<Bytes, Bytes> consumer, Map<Integer, Long> endOffsets, List<TopicMessage> messages) {
        int emptyPolls = 0;
        int messegesCount = 0;
        while (emptyPolls < 3 && messegesCount < limit) {
            ConsumerRecords<Bytes, Bytes> records = getConsumerRecords(consumer);
            if (records.isEmpty()) {
                emptyPolls++;
            } else {
                emptyPolls = 0;
            }
            for (ConsumerRecord<Bytes, Bytes> consumerRecord : records) {
                if (consumerRecord.offset() >= endOffsets.get(consumerRecord.partition())) {
                    log.debug("TCM70 record offset greater than endOffset! partition={}, offset={}, endOffset={}", consumerRecord.partition(), consumerRecord.offset(), endOffsets.get(consumerRecord.partition()));
                    messegesCount = limit;
                    continue;
                }

                DeserializedValue deserializedValue = serdeService.deserialize(clusterId, consumerRecord);
                // TODO - dorobić zwrotkę (rozszerzyć TopicMessage) na front z danymi dotyczącymi schemy, tak aby je zaprezentować

                if (messegesCount < limit) {
                    messegesCount += 1;
                    messages.add(TopicMessage
                            .builder()
                            .key(deserializedValue.getDeserializedKey())
                            .value(deserializedValue.getDeserializedValue())
                            .offset(consumerRecord.offset())
                            .partition(consumerRecord.partition())
                            .topic(consumerRecord.topic())
                            .timestamp(consumerRecord.timestamp())
                            .headers(mapHeaders(consumerRecord.headers()))
                            .build());
                }
            }
        }
    }

    private ConsumerRecords<Bytes, Bytes> getConsumerRecords(KafkaConsumer<Bytes, Bytes> consumer) {
        long startTime = System.nanoTime();
        ConsumerRecords<Bytes, Bytes> records = consumer.poll(Duration.ofMillis(100));
        log.debug("TCM40 poll took={}ms, returned {} records", (System.nanoTime() - startTime) / 1000000, records.count());
        return records;
    }

    @PostMapping("/api/topic/send/{topicName}/{count}")
    @EntryExitLogger
    public void send(@PathVariable("topicName") String topicName,
                     @PathVariable("count") int count,
                     @RequestBody TopicMessage message,
                     @RequestParam("serverId") String serverId) {
        log.debug("TCS01 topicName={}, count={}, serverId={}", topicName, count, serverId);
        validateTopics(serverId, Collections.singletonList(topicName));
        KafkaTemplate<Bytes, Bytes> kafkaTemplate = kafkaConnectionService.getKafkaTemplate(serverId);
        String key = message.getKey() != null ? message.getKey(): "";
        String value = message.getValue() != null ? message.getValue(): "";
        for (int i = 0; i < count; i++) {
            ProducerRecord<Bytes, Bytes> producerRecord = serdeService.serialize(serverId, topicName, replaceTokens(key, i), replaceTokens(value, i));
            for (TopicMessageHeader header : message.getHeaders()) {
                producerRecord
                        .headers()
                        .add(replaceTokens(header.getKey(), i), header.getValue() != null ? replaceTokens(header.getValue(), i).getBytes(StandardCharsets.UTF_8) : null);
            }
            kafkaTemplate.send(producerRecord);
        }
        kafkaTemplate.flush();
        log.debug("TCS99 topicName={}, count={}, serverId={}", topicName, count, serverId);
    }

    private String replaceTokens(String data, int i) {
        return data
                .replace("{{count}}", String.valueOf(i))
                .replace("{{timestamp}}", String.valueOf(System.currentTimeMillis()))
                .replace("{{uuid}}", UUID.randomUUID().toString());
    }


}
