package com.consdata.kouncil.topic;

import com.consdata.kouncil.KouncilConfiguration;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@RestController
public class TopicController {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final KouncilConfiguration kouncilConfiguration;

    public TopicController(KafkaTemplate<String, String> kafkaTemplate,
                           KouncilConfiguration kouncilConfiguration) {
        this.kafkaTemplate = kafkaTemplate;
        this.kouncilConfiguration = kouncilConfiguration;
    }

    @GetMapping("/api/topic/messages/{topicName}/{partition}/{offset}")
    public TopicMessagesDto getTopicMessages(@PathVariable("topicName") String topicName,
                                             @PathVariable("partition") String partitions,
                                             @PathVariable("offset") String offset,
                                             @RequestParam("offset") String offsetShiftParam,
                                             @RequestParam("limit") String limitParam,
                                             @RequestParam(value = "beginningTimestampMillis", required = false) Long beginningTimestampMillis) {
        log.debug("TCM01 topicName={}, partition={}, offset={}, offsetParam={}, limit={}, beginningTimestampMillis={}", topicName, partitions, offset, offsetShiftParam, limitParam, beginningTimestampMillis);
        int limit = Integer.parseInt(limitParam);
        long offsetShift = Long.parseLong(offsetShiftParam);
        Properties props = createCommonProperties();
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            List<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
            log.debug("TCM02 partitionInfos.size={}, partitionInfos={}", partitionInfos.size(), partitionInfos);
            List<TopicPartition> topicPartitions = new ArrayList<>();
            for (int i = 0; i < partitionInfos.size(); i++) {
                topicPartitions.add(new TopicPartition(topicName, i));
            }
            consumer.assign(topicPartitions);

            int[] partitionsArray;
            if (partitions.equalsIgnoreCase("all")) {
                partitionsArray = IntStream.rangeClosed(0, topicPartitions.size() - 1).toArray();
            } else {
                partitionsArray = Arrays.stream(partitions.split(",")).mapToInt(Integer::parseInt).toArray();
            }

            Map<Integer, Long> beginningOffsets = consumer
                    .beginningOffsets(topicPartitions).entrySet().stream()
                    .collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
            Map<Integer, Long> startOffsets = beginningOffsets;
            if (beginningTimestampMillis != null) {
                Map<TopicPartition, Long> beginningTimestamps = topicPartitions.stream()
                        .collect(Collectors.toMap(Function.identity(), ignore -> beginningTimestampMillis));
                startOffsets = consumer.offsetsForTimes(beginningTimestamps).entrySet().stream()
                        .collect(Collectors.toMap(
                                k -> k.getKey().partition(),
                                v -> v.getValue() == null ? beginningOffsets.get(v.getKey().partition()) : v.getValue().offset()
                        ));
            }

            Map<Integer, Long> endOffsets = consumer.endOffsets(topicPartitions).entrySet()
                    .stream().collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
            log.debug("TCM03 beginningOffsets={}", beginningOffsets);
            log.debug("TCM03 startOffsets={}", startOffsets);
            log.debug("TCM04 endOffsets={}", endOffsets);

            for (int j : partitionsArray) {

                Long startOffsetForPartition = startOffsets.get(j);
                log.debug("TCM05 startOffsetForPartition={}", startOffsetForPartition);
                long position = consumer.position(topicPartitions.get(j)) - offsetShift;
                log.debug("TCM06 position={}", position);
                long seekTo = position - (limit / partitionsArray.length);
                if (seekTo > startOffsetForPartition) {
                    log.debug("TCM11 seekTo={}", seekTo);
                    consumer.seek(topicPartitions.get(j), seekTo);
                } else {
                    log.debug("TCM12 seekTo startOffset({})", startOffsetForPartition);
                    consumer.seek(topicPartitions.get(j), startOffsetForPartition);
                }
            }

            List<TopicMessage> messages = new ArrayList<>();
            int i = 0;
            // couple first polls after seek don't return eny records
            while (i < 100 && messages.size() < limit) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(10));
                for (ConsumerRecord<String, String> record : records) {
                    if (messages.size() < limit) {
                        messages.add(TopicMessage
                                .builder()
                                .key(record.key())
                                .value(record.value())
                                .offset(record.offset())
                                .partition(record.partition())
                                .timestamp(record.timestamp())
                                .build());
                    }
                }
                i++;
            }
            log.debug("TCM20 poll completed records.size={}", messages.size());
            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));
            TopicMessagesDto topicMessagesDto = TopicMessagesDto.builder()
                    .messages(messages)
                    .partitionOffsets(startOffsets)
                    .partitionBeginningOffsets(beginningOffsets)
                    .partitionEndOffsets(endOffsets)
                    // pagination works only for single selected partition
                    .totalResults(partitionsArray.length == 1
                            ? endOffsets.get(partitionsArray[0]) - startOffsets.get(partitionsArray[0])
                            : null)
                    .build();
            log.debug("TCM99 topicName={}, partition={}, offset={} topicMessages.size={}", topicName, partitions, offset, topicMessagesDto.getMessages().size());
            return topicMessagesDto;

        }
    }

    @PostMapping("/api/topic/send/{topic}/{count}")
    @EntryExitLogger
    public void send(@PathVariable("topic") String topic,
                     @PathVariable("count") int count,
                     @RequestBody TopicMessage message) {
        for (int i = 0; i < count; i++) {
            kafkaTemplate.send(topic, replaceTokens(message.getKey(), i), replaceTokens(message.getValue(), i));
        }
        kafkaTemplate.flush();
    }

    private String replaceTokens(String data, int i) {
        return data
                .replace("{{count}}", String.valueOf(i))
                .replace("{{timestamp}}", String.valueOf(System.currentTimeMillis()))
                .replace("{{uuid}}", UUID.randomUUID().toString());
    }

    private Properties createCommonProperties() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kouncilConfiguration.getBootstrapServers());
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        return props;
    }
}
