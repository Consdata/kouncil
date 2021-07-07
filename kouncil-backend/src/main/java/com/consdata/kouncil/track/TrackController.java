package com.consdata.kouncil.track;

import com.consdata.kouncil.AbstractMessagesController;
import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.topic.TopicMessage;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.logging.log4j.util.Strings;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@RestController
public class TrackController extends AbstractMessagesController {

    private static final int POLL_TIMEOUT = 10000;

    public TrackController(KafkaConnectionService kafkaConnectionService) {
        super(kafkaConnectionService);
    }

    @GetMapping("/api/track")
    public List<TopicMessage> getTopicMessages(@RequestParam("topicNames") List<String> topicNames,
                                               @RequestParam("field") String field,
                                               @RequestParam("value") String value,
                                               @RequestParam("beginningTimestampMillis") Long beginningTimestampMillis,
                                               @RequestParam("endTimestampMillis") Long endTimestampMillis,
                                               @RequestParam("serverId") String serverId) {
        log.debug("TRACK01 topicNames={}, field={}, value={}, beginningTimestampMillis={}, endTimestampMillis={}",
                topicNames, field, value, beginningTimestampMillis, endTimestampMillis);
        validateTopics(serverId, topicNames);
        try (KafkaConsumer<String, String> consumer = kafkaConnectionService.getKafkaConsumer(serverId, 5000)) {
            List<TopicMessage> messages = new ArrayList<>();
            topicNames.forEach(t -> {
                Map<Integer, TopicPartition> partitionMap;
                Collector<Integer, ?, Map<Integer, TopicPartition>> integerMapCollector = Collectors.toMap(Function.identity(), p -> new TopicPartition(t, p));
                List<PartitionInfo> partitionInfos = consumer.partitionsFor(t);
                partitionMap = IntStream.rangeClosed(0, partitionInfos.size() - 1)
                        .boxed()
                        .collect(integerMapCollector);

                consumer.assign(partitionMap.values());

                Map<Integer, Long> beginningOffsets = calculateBeginningOffsets(beginningTimestampMillis, consumer, partitionMap.values());
                log.debug("TRACK03 beginningOffsets={}", beginningOffsets);

                Map<Integer, Long> endOffsets = calculateEndOffsets(endTimestampMillis, consumer, partitionMap.values());
                log.debug("TRACK04 endOffsets={}", endOffsets);

                boolean[] exhausted = new boolean[partitionMap.size()];
                for (Map.Entry<Integer, TopicPartition> entry : partitionMap.entrySet()) {
                    Integer partitionIndex = entry.getKey();
                    Long startOffsetForPartition = beginningOffsets.get(partitionIndex);
                    log.debug("TRACK50 partition={}, startOffsetForPartition={}", partitionIndex, startOffsetForPartition);
                    if (startOffsetForPartition < 0) {
                        log.debug("TRACK51 startOffsetForPartition is -1, seekToEnd, topic={}, partition={}", t, partitionIndex);
                        consumer.seekToEnd(Collections.singletonList(partitionMap.get(partitionIndex)));
                        exhausted[partitionIndex] = true;
                    } else {
                        log.debug("TRACK52 topic={}, partition={}, startOffsetForPartition={}", t, partitionIndex, startOffsetForPartition);
                        consumer.seek(partitionMap.get(partitionIndex), startOffsetForPartition);
                    }
                }

                long startTime = System.nanoTime();
                List<TopicMessage> candidates = new ArrayList<>();
                while (falseExists(exhausted)) {
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(POLL_TIMEOUT));
                    log.debug("TRACK70 poll took={}ms, returned {} records for topic {}", (System.nanoTime() - startTime) / 1000000, records.count(), t);
                    for (ConsumerRecord<String, String> record : records) {
                        if (record.offset() >= endOffsets.get(record.partition())) {
                            if (!exhausted[record.partition()]) {
                                log.debug("TRACK24 topic={}, partition={} exhausted", t, record.partition());
                                exhausted[record.partition()] = true;
                            }
                            continue;
                        }
                        if (Strings.isBlank(field)
                                || (Strings.isNotBlank(field) && Strings.isNotBlank(value) && headerMatch(record.headers(), field, value))) {
                            candidates.add(TopicMessage
                                    .builder()
                                    .topic(t)
                                    .key(record.key())
                                    .value(record.value())
                                    .offset(record.offset())
                                    .partition(record.partition())
                                    .timestamp(record.timestamp())
                                    .headers(mapHeaders(record.headers()))
                                    .build());
                        }
                    }
                }
                log.debug("TRACK90 poll completed topic={}, candidates.size={}", t, candidates.size());
                messages.addAll(candidates);
            });
            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));
            log.debug("TRACK99 search completed result.size={}", messages.size());
            if (messages.size() > 1000) {
                log.warn("Result to large for browser to handle!");
                return messages.subList(0, 1000);
            }
            return messages;
        }
    }

    private boolean falseExists(boolean[] exhausted) {
        log.debug("{}", exhausted);
        for (boolean b : exhausted) {
            if (!b) return true;
        }
        return false;
    }

    private boolean headerMatch(Headers headers, String field, String value) {
        for (Header header : headers) {
            if (field.equals(header.key()) && new String(header.value()).contains(value)) {
                return true;
            }
        }
        return false;
    }


}
