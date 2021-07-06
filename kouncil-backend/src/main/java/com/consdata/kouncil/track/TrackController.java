package com.consdata.kouncil.track;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.topic.TopicMessage;
import com.consdata.kouncil.topic.TopicMessageHeader;
import lombok.AllArgsConstructor;
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
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@RestController
@AllArgsConstructor
public class TrackController {

    private static final int POLL_TIMEOUT = 10000;

    private final KafkaConnectionService kafkaConnectionService;

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
        try (KafkaConsumer<String, String> consumer = kafkaConnectionService.getKafkaConsumer(serverId)) {
            List<TopicMessage> messages = new ArrayList<>();
            topicNames.forEach(t -> {
                List<PartitionInfo> partitionInfos = consumer.partitionsFor(t);
                log.debug("TRACK20 topic={}, partitionInfos={}", t, partitionInfos);
                List<TopicPartition> topicPartitions = new ArrayList<>();
                for (int i = 0; i < partitionInfos.size(); i++) {
                    topicPartitions.add(new TopicPartition(t, i));
                }
                consumer.assign(topicPartitions);
                Map<Integer, Long> beginningOffsets;
                Map<TopicPartition, Long> beginningTimestamps = topicPartitions.stream()
                        .collect(Collectors.toMap(Function.identity(), ignore -> beginningTimestampMillis));
                beginningOffsets = consumer.offsetsForTimes(beginningTimestamps).entrySet().stream()
                        .collect(Collectors.toMap(
                                k -> k.getKey().partition(),
                                v -> v.getValue() == null ? -1 : v.getValue().offset()
                        ));

                final Map<Integer, Long> globalEndOffsets = consumer.endOffsets(topicPartitions).entrySet()
                        .stream().collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
                final Map<Integer, Long> endOffsets;
                Map<TopicPartition, Long> endTimestamps = topicPartitions.stream()
                        .collect(Collectors.toMap(Function.identity(), ignore -> endTimestampMillis + 1));
                endOffsets = consumer.offsetsForTimes(endTimestamps).entrySet().stream()
                        .collect(Collectors.toMap(
                                k -> k.getKey().partition(),
                                v -> v.getValue() == null ? globalEndOffsets.get(v.getKey().partition()) - 1 : v.getValue().offset()
                        ));

                log.debug("TRACK21 topic={}, beginningOffsets={}, endOffsets={}", t, beginningOffsets, endOffsets);
                boolean[] exhausted = new boolean[topicPartitions.size()];

                for (int partitionIndex : IntStream.rangeClosed(0, topicPartitions.size() - 1).toArray()) {
                    Long startOffsetForPartition = beginningOffsets.get(partitionIndex);
                    if (startOffsetForPartition < 0) {
                        log.debug("TRACK22 startOffsetForPartition is -1, seekToEnd, topic={}, partition={}", t, partitionIndex);
                        consumer.seekToEnd(Collections.singletonList(topicPartitions.get(partitionIndex)));
                        exhausted[partitionIndex] = true;
                    } else {
                        log.debug("TRACK23 topic={}, partition={}, startOffsetForPartition={}", t, partitionIndex, startOffsetForPartition);
                        consumer.seek(topicPartitions.get(partitionIndex), startOffsetForPartition);
                    }
                }


                long startTime = System.nanoTime();
                List<TopicMessage> candidates = new ArrayList<>();
                while (falseExists(exhausted)) {
                    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(POLL_TIMEOUT));
                    log.debug("TRACK23 poll took={}ms, returned {} records for topic {}", (System.nanoTime() - startTime) / 1000000, records.count(), t);
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
                log.debug("TRACK25 poll completed topic={}, candidates.size={}", t, candidates.size());
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


    private List<TopicMessageHeader> mapHeaders(Headers headers) {
        List<TopicMessageHeader> result = new ArrayList<>();
        for (Header header : headers) {
            result.add(TopicMessageHeader.builder()
                    .key(header.key())
                    .value(header.value() == null ? null : new String(header.value()))
                    .build());
        }
        return result;
    }

    private boolean headerMatch(Headers headers, String field, String value) {
        for (Header header : headers) {
            if (field.equals(header.key()) && new String(header.value()).contains(value)) {
                return true;
            }
        }
        return false;
    }


    private void validateTopics(String serverId, List<String> topicNames) {
        boolean topicsExists;
        try {
            topicsExists = kafkaConnectionService
                    .getAdminClient(serverId)
                    .listTopics()
                    .names()
                    .get().containsAll(topicNames);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(String.format("Cannot check if topics [%s] exists on server [%s](%s)", topicNames, serverId, e.getMessage()));
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(String.format("Cannot check if topics [%s] exists on server [%s](%s)", topicNames, serverId, e.getMessage()));
        }
        if (!topicsExists) {
            throw new KouncilRuntimeException(String.format("Topics [%s] not exists on server [%s]", topicNames, serverId));
        }
    }
}
