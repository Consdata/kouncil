package com.consdata.kouncil.topic;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.LongStream;

@Slf4j
@RestController
@AllArgsConstructor
public class TopicController {

    private static final int POLL_TIMEOUT = 10000;

    private final KafkaConnectionService kafkaConnectionService;

    @GetMapping("/api/topic/messages/{topicName}/{partition}")
    public TopicMessagesDto getTopicMessages(@PathVariable("topicName") String topicName,
                                             @PathVariable("partition") String partitions,
                                             @RequestParam("offset") String offsetShiftParam,
                                             @RequestParam("limit") String limitParam,
                                             @RequestParam(value = "beginningTimestampMillis", required = false) Long beginningTimestampMillis,
                                             @RequestParam(value = "endTimestampMillis", required = false) Long endTimestampMillis,
                                             @RequestParam("serverId") String serverId) {
        log.debug("TCM01 topicName={}, partition={}, offsetShift={}, limit={}, beginningTimestampMillis={}, endTimestampMillis={}",
                topicName, partitions, offsetShiftParam, limitParam, beginningTimestampMillis, endTimestampMillis);
        checkTopicExists(serverId, topicName);
        int limit = Integer.parseInt(limitParam);
        long offsetShift = Long.parseLong(offsetShiftParam);
        try (KafkaConsumer<String, String> consumer = kafkaConnectionService.getKafkaConsumer(serverId)) {

            List<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
            List<TopicPartition> topicPartitions = new ArrayList<>();
            for (int i = 0; i < partitionInfos.size(); i++) {
                topicPartitions.add(new TopicPartition(topicName, i));
            }
            consumer.assign(topicPartitions);

            Map<Integer, Long> beginningOffsets = calculateBeginningOffsets(beginningTimestampMillis, consumer, topicPartitions);
            log.debug("TCM03 beginningOffsets={}", beginningOffsets);

            final Map<Integer, Long> endOffsets = calculateEndOffsets(endTimestampMillis, consumer, topicPartitions);
            log.debug("TCM04 endOffsets={}", endOffsets);

            int[] partitionsArray;
            if (partitions.equalsIgnoreCase("all")) {
                partitionsArray = IntStream.rangeClosed(0, topicPartitions.size() - 1).toArray();
            } else {
                partitionsArray = Arrays.stream(partitions.split(",")).mapToInt(Integer::parseInt).toArray();
            }


            long availablePartitions = Arrays.stream(partitionsArray).filter(p -> beginningOffsets.get(p) >= 0).count();
            for (int j : partitionsArray) {
                Long startOffsetForPartition = beginningOffsets.get(j);
                log.debug("TCM05 partition={}, startOffsetForPartition={}", j, startOffsetForPartition);
                if (startOffsetForPartition < 0) {
                    log.debug("TCM10 startOffsetForPartition is -1, seekToEnd");
                    consumer.seekToEnd(Collections.singletonList(topicPartitions.get(j)));
                    continue;
                }

                long position = endOffsets.get(j) - offsetShift;
                log.debug("TCM06 partition={}, position={}", j, position);
                long seekTo = position - (limit / availablePartitions);
                if (seekTo > startOffsetForPartition) {
                    log.debug("TCM11 partition={}, seekTo={}", j, seekTo);
                    consumer.seek(topicPartitions.get(j), seekTo);
                } else {
                    log.debug("TCM12 partition={}, seekTo startOffset={}", j, startOffsetForPartition);
                    consumer.seek(topicPartitions.get(j), startOffsetForPartition);
                }
            }

            List<TopicMessage> messages = new ArrayList<>();
            long startTime = System.nanoTime();
            ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(POLL_TIMEOUT));
            log.debug("TCM19 poll took={}ms, returned {} records", (System.nanoTime() - startTime) / 1000000, records.count());
            for (ConsumerRecord<String, String> record : records) {
                if (record.offset() >= endOffsets.get(record.partition())) {
                    continue;
                }
                if (messages.size() < limit) {
                    messages.add(TopicMessage
                            .builder()
                            .key(record.key())
                            .value(record.value())
                            .offset(record.offset())
                            .partition(record.partition())
                            .timestamp(record.timestamp())
                            .headers(mapHeaders(record.headers()))
                            .build());
                }
            }
            log.debug("TCM20 poll completed records.size={}", messages.size());
            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));

            long totalResult = LongStream
                    .range(0, partitionsArray.length)
                    // index will never exceed max int, so this cast should be safe
                    .map(index -> endOffsets.get(partitionsArray[(int) index]) - beginningOffsets.get(partitionsArray[(int) index]))
                    .sum();
            TopicMessagesDto topicMessagesDto = TopicMessagesDto.builder()
                    .messages(messages)
                    .partitionOffsets(beginningOffsets)
                    .partitionEndOffsets(endOffsets)
                    .totalResults(totalResult)
                    .build();
            log.debug("TCM99 topicName={}, partition={}, offsetShift={} topicMessages.size={}", topicName, partitions, offsetShift, topicMessagesDto.getMessages().size());
            return topicMessagesDto;

        }
    }

    private Map<Integer, Long> calculateEndOffsets(Long endTimestampMillis, KafkaConsumer<String, String> consumer, List<TopicPartition> topicPartitions) {
        final Map<Integer, Long> endOffsets;
        final Map<Integer, Long> globalEndOffsets = consumer.endOffsets(topicPartitions).entrySet()
                .stream().collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
        if (endTimestampMillis != null) {
            Map<TopicPartition, Long> endTimestamps = topicPartitions.stream()
                    .collect(Collectors.toMap(Function.identity(), ignore -> endTimestampMillis + 1));
            endOffsets = consumer.offsetsForTimes(endTimestamps).entrySet().stream()
                    .collect(Collectors.toMap(
                            k -> k.getKey().partition(),
                            v -> v.getValue() == null ? globalEndOffsets.get(v.getKey().partition()) : v.getValue().offset()
                    ));
        } else {
            endOffsets = globalEndOffsets;
        }
        return endOffsets;
    }

    private Map<Integer, Long> calculateBeginningOffsets(Long beginningTimestampMillis, KafkaConsumer<String, String> consumer, List<TopicPartition> topicPartitions) {
        Map<Integer, Long> beginningOffsets;
        if (beginningTimestampMillis != null) {
            Map<TopicPartition, Long> beginningTimestamps = topicPartitions.stream()
                    .collect(Collectors.toMap(Function.identity(), ignore -> beginningTimestampMillis));
            beginningOffsets = consumer.offsetsForTimes(beginningTimestamps).entrySet().stream()
                    .collect(Collectors.toMap(
                            k -> k.getKey().partition(),
                            v -> v.getValue() == null ? -1 : v.getValue().offset()
                    ));
        } else {
            beginningOffsets = consumer
                    .beginningOffsets(topicPartitions).entrySet().stream()
                    .collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
        }
        return beginningOffsets;
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

    @PostMapping("/api/topic/send/{topicName}/{count}")
    @EntryExitLogger
    public void send(@PathVariable("topicName") String topicName,
                     @PathVariable("count") int count,
                     @RequestBody TopicMessage message,
                     @RequestParam("serverId") String serverId) {
        log.debug("TCS01 topicName={}, count={}, serverId={}", topicName, count, serverId);
        checkTopicExists(serverId, topicName);
        KafkaTemplate<String, String> kafkaTemplate = kafkaConnectionService.getKafkaTemplate(serverId);
        for (int i = 0; i < count; i++) {
            kafkaTemplate.send(topicName, replaceTokens(message.getKey(), i), replaceTokens(message.getValue(), i));
        }
        kafkaTemplate.flush();
        log.debug("TCS99 topicName={}, count={}, serverId={}", topicName, count, serverId);
    }

    private void checkTopicExists(String serverId, String topicName) {
        boolean topicExists;
        try {
            topicExists = kafkaConnectionService
                    .getAdminClient(serverId)
                    .listTopics()
                    .names()
                    .get()
                    .stream().anyMatch(t -> t.equalsIgnoreCase(topicName));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(String.format("Cannot check if topic [%s] exists on server [%s](%s)", topicName, serverId, e.getMessage()));
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(String.format("Cannot check if topic [%s] exists on server [%s](%s)", topicName, serverId, e.getMessage()));
        }
        if (!topicExists) {
            throw new KouncilRuntimeException(String.format("Topic [%s] not exists on server [%s]", topicName, serverId));
        }
    }

    private String replaceTokens(String data, int i) {
        return data
                .replace("{{count}}", String.valueOf(i))
                .replace("{{timestamp}}", String.valueOf(System.currentTimeMillis()))
                .replace("{{uuid}}", UUID.randomUUID().toString());
    }


}
