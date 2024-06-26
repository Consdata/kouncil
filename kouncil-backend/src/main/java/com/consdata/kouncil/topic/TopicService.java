package com.consdata.kouncil.topic;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.MessagesHelper;
import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.serde.serialization.SerializationService;
import com.consdata.kouncil.topic.util.FieldType;
import com.consdata.kouncil.topic.util.PlaceholderFormatUtil;
import com.consdata.kouncil.track.TopicMetadata;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.kafka.clients.admin.CreateTopicsResult;
import org.apache.kafka.clients.admin.DeleteTopicsResult;
import org.apache.kafka.clients.admin.DescribeTopicsResult;
import org.apache.kafka.clients.admin.NewPartitions;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicService {

    private final KafkaConnectionService kafkaConnectionService;
    private final SerializationService serializationService;
    private final DeserializationService deserializationService;
    private final MessagesHelper messagesHelper;
    private static final int RESEND_MAX_POLL_RECORDS = 100;

    @Value("${resendHeadersToKeep:}")
    private String[] resendHeadersToKeep;

    TopicMessagesDto getTopicMessages(@PathVariable("topicName") String topicName,
                                      @PathVariable("partition") String partitions,
                                      @RequestParam("page") String pageParam,
                                      @RequestParam("limit") String limitParam,
                                      @RequestParam(value = "beginningTimestampMillis", required = false) Long beginningTimestampMillis,
                                      @RequestParam(value = "endTimestampMillis", required = false) Long endTimestampMillis,
                                      @RequestParam(value = "offset", required = false) Long offset,
                                      @RequestParam("serverId") String serverId) {
        messagesHelper.validateTopics(serverId, singletonList(topicName));
        int limit = Integer.parseInt(limitParam); // per partition!
        long page = Long.parseLong(pageParam); // per partition!
        try (KafkaConsumer<Bytes, Bytes> consumer = kafkaConnectionService.getKafkaConsumer(serverId, limit)) {
            TopicMetadata metadata = prepareMetadata(topicName, partitions, beginningTimestampMillis, endTimestampMillis, offset, consumer);
            log.debug("TCM20 metadata={}", metadata);

            List<TopicMessage> messages = new ArrayList<>();
            for (Map.Entry<Integer, TopicPartition> entry : metadata.getPartitions().entrySet()) {

                Integer partitionIndex = entry.getKey();
                TopicPartition partition = entry.getValue();
                consumer.assign(singletonList(partition));

                Long startOffsetForPartition = metadata.getBeginningOffsets().get(partitionIndex);
                Long endOffsetForPartition = metadata.getEndOffsets().get(partitionIndex);
                log.debug("TCM50 partition={}, startOffsetForPartition={}, endOffsetForPartition={}", partitionIndex, startOffsetForPartition,
                        endOffsetForPartition);
                if (startOffsetForPartition < 0) {
                    log.debug("TCM51 startOffsetForPartition is -1, seekToEnd");
                    consumer.seekToEnd(singletonList(partition));
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
                pollMessages(serverId, limit, consumer, endOffsetForPartition, partition, messages);
            }

            log.debug("TCM90 poll completed records.size={}", messages.size());
            messages.sort(Comparator.comparing(TopicMessage::getTimestamp));

            long totalResult = metadata.getEndOffsets().keySet().stream()
                    .map(index -> metadata.getEndOffsets().get(index) - metadata.getBeginningOffsets().get(index)).reduce(0L, Long::max);
            TopicMessagesDto topicMessagesDto = TopicMessagesDto.builder()
                    .messages(messages)
                    .partitionOffsets(metadata.getBeginningOffsets())
                    .partitionEndOffsets(metadata.getEndOffsets())
                    .totalResults(totalResult)
                    .build();
            log.debug("TCM99 topicName={}, partition={}, page={} topicMessages.size={}, totalResult={}", topicName, partitions, page,
                    topicMessagesDto.getMessages().size(), totalResult);
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

        Map<Integer, Long> beginningOffsets = messagesHelper.calculateBeginningOffsets(beginningTimestampMillis, offset, consumer, partitionMap.values());
        Map<Integer, Long> endOffsets = messagesHelper.calculateEndOffsets(endTimestampMillis, offset, consumer, partitionMap.values());
        return TopicMetadata.builder()
                .topicName(topicName)
                .partitions(partitionMap)
                .beginningOffsets(beginningOffsets)
                .endOffsets(endOffsets)
                .build();
    }

    /**
     * Sometimes poll after seek returns no results. So we try to call it until we receive 5 consecutive empty polls or have enough messages or received last
     * message
     */
    private void pollMessages(String clusterId, int limit, KafkaConsumer<Bytes, Bytes> consumer, Long endOffset, TopicPartition partition,
            List<TopicMessage> messages) {
        int emptyPolls = 0;
        int messagesCount = 0;
        long lastOffset = 0;
        while (emptyPolls < 5 && messagesCount < limit && lastOffset <= endOffset - 1) {
            ConsumerRecords<Bytes, Bytes> records = getConsumerRecords(consumer, partition);
            if (records.isEmpty()) {
                emptyPolls++;
            } else {
                emptyPolls = 0;
            }
            for (ConsumerRecord<Bytes, Bytes> consumerRecord : records) {
                if (consumerRecord.offset() >= endOffset) {
                    log.debug("TCM70 record offset greater than endOffset! partition={}, offset={}, endOffset={}", consumerRecord.partition(),
                            consumerRecord.offset(), endOffset);
                    messagesCount = limit;
                    continue;
                }

                DeserializedMessage deserializedMessage = deserializationService.deserialize(clusterId, consumerRecord);
                if (messagesCount < limit) {
                    messagesCount += 1;
                    messages.add(TopicMessage
                            .builder()
                            .key(deserializedMessage.getKeyData().getDeserialized())
                            .keyFormat(deserializedMessage.getKeyData().getMessageFormat())
                            .value(deserializedMessage.getValueData().getDeserialized())
                            .originalValue(deserializedMessage.getValueData().getOriginalValue())
                            .valueFormat(deserializedMessage.getValueData().getMessageFormat())
                            .offset(consumerRecord.offset())
                            .partition(consumerRecord.partition())
                            .topic(consumerRecord.topic())
                            .timestamp(consumerRecord.timestamp())
                            .headers(messagesHelper.mapHeaders(consumerRecord.headers()))
                            .build());
                }
                lastOffset = consumerRecord.offset();
            }
        }

    }

    private ConsumerRecords<Bytes, Bytes> getConsumerRecords(KafkaConsumer<Bytes, Bytes> consumer, TopicPartition partition) {
        long startTime = System.nanoTime();
        ConsumerRecords<Bytes, Bytes> records = consumer.poll(Duration.ofMillis(200));
        log.debug("TCM40 poll took={}ms, returned {} records from {}", (System.nanoTime() - startTime) / 1000000, records.count(), partition);
        return records;
    }

    public void resend(TopicResendEventsModel resendParams, String serverId) {
        messagesHelper.validateTopics(serverId, asList(resendParams.getSourceTopicName(), resendParams.getDestinationTopicName()));
        log.info("Resend with params: {}", resendParams);
        try (KafkaConsumer<Bytes, Bytes> consumer = kafkaConnectionService.getKafkaConsumer(serverId, RESEND_MAX_POLL_RECORDS)) {
            TopicPartition sourceTopicPartition = new TopicPartition(resendParams.getSourceTopicName(), resendParams.getSourceTopicPartition());
            validateOffsetRange(resendParams, consumer, sourceTopicPartition);

            consumer.assign(singletonList(sourceTopicPartition));
            consumer.seek(sourceTopicPartition, resendParams.getOffsetBeginning());

            KafkaTemplate<Bytes, Bytes> kafkaTemplate = kafkaConnectionService.getKafkaTemplate(serverId);

            int emptyPolls = 0;
            long resentMessagesCount = 0;
            long lastOffset = -1;
            while (emptyPolls < 3 && lastOffset < resendParams.getOffsetEnd()) {
                ConsumerRecords<Bytes, Bytes> records = getConsumerRecords(consumer, sourceTopicPartition);
                log.info("Polled {} records for resend", records.count());
                if (records.isEmpty()) {
                    emptyPolls++;
                } else {
                    emptyPolls = 0;
                }
                for (ConsumerRecord<Bytes, Bytes> consumerRecord : records) {
                    lastOffset = consumerRecord.offset();
                    if (lastOffset > resendParams.getOffsetEnd()) {
                        break;
                    }
                    resentMessagesCount++;
                    resendOneRecord(consumerRecord, kafkaTemplate, resendParams.getDestinationTopicName(), resendParams.getDestinationTopicPartition(),
                            resendParams.isShouldFilterOutHeaders());
                }
                log.info("Resent {}% completed", resentMessagesCount * 100 / (resendParams.getOffsetEnd() - resendParams.getOffsetBeginning() + 1));
            }
            if (resentMessagesCount > 0) {
                kafkaTemplate.flush();
            }
            log.info("Resent {} messages", resentMessagesCount);
        }
    }

    private static void validateOffsetRange(TopicResendEventsModel resendParams, KafkaConsumer<Bytes, Bytes> consumer, TopicPartition sourceTopicPartition) {
        Long sourcePartitionBeginningOffset = consumer.beginningOffsets(singletonList(sourceTopicPartition)).get(sourceTopicPartition);
        Long sourcePartitionEndOffset = consumer.endOffsets(singletonList(sourceTopicPartition)).get(sourceTopicPartition);

        if (resendParams.getOffsetBeginning() < sourcePartitionBeginningOffset || resendParams.getOffsetBeginning() > sourcePartitionEndOffset
                || resendParams.getOffsetEnd() < sourcePartitionBeginningOffset || resendParams.getOffsetEnd() > sourcePartitionEndOffset) {
            log.error("Submitted offset range {}-{} is outside topic offset range {}-{}",
                    resendParams.getOffsetBeginning(), resendParams.getOffsetEnd(), sourcePartitionBeginningOffset, sourcePartitionEndOffset);
            throw new KouncilRuntimeException(String.format("Submitted offset range %d-%d is outside topic offset range %d-%d",
                    resendParams.getOffsetBeginning(), resendParams.getOffsetEnd(), sourcePartitionBeginningOffset, sourcePartitionEndOffset));
        }
    }

    private void resendOneRecord(ConsumerRecord<Bytes, Bytes> consumerRecord, KafkaTemplate<Bytes, Bytes> kafkaTemplate, String destinationTopic,
            Integer destinationTopicPartition, boolean shouldFilterOutHeaders) {
        ProducerRecord<Bytes, Bytes> producerRecord = new ProducerRecord<>(destinationTopic, destinationTopicPartition, consumerRecord.key(),
                consumerRecord.value(),
                shouldFilterOutHeaders ? getFilteredOutHeaders(consumerRecord.headers()) : consumerRecord.headers());
        kafkaTemplate.send(producerRecord);
    }

    private List<Header> getFilteredOutHeaders(Headers headers) {
        return Arrays.stream(headers.toArray())
                .filter(header -> ArrayUtils.contains(resendHeadersToKeep, header.key()))
                .toList();
    }

    private String replaceTokens(String data, int i) {
        data = PlaceholderFormatUtil.formatPlaceholder("\\{\\{count(.*?)}}", data, FieldType.STRING, i);
        data = PlaceholderFormatUtil.formatPlaceholder("\\{\\{timestamp(.*?)}}", data, FieldType.DATE, LocalDate.now());
        data = PlaceholderFormatUtil.formatPlaceholder("\\{\\{uuid(.*?)}}", data, FieldType.STRING, UUID.randomUUID().toString());
        return data;
    }

    public void send(String topicName, int count, TopicMessage message, String serverId) {
        messagesHelper.validateTopics(serverId, singletonList(topicName));
        KafkaTemplate<Bytes, Bytes> kafkaTemplate = kafkaConnectionService.getKafkaTemplate(serverId);
        String key = message.getKey() != null ? message.getKey() : "";
        String value = message.getValue() != null ? message.getValue() : "";
        for (int i = 0; i < count; i++) {
            ProducerRecord<Bytes, Bytes> producerRecord = serializationService.serialize(serverId, topicName, replaceTokens(key, i), replaceTokens(value, i));
            for (TopicMessageHeader header : message.getHeaders()) {
                producerRecord
                        .headers()
                        .add(replaceTokens(header.getKey(), i),
                                header.getValue() != null ? replaceTokens(header.getValue(), i).getBytes(StandardCharsets.UTF_8) : null);
            }
            kafkaTemplate.send(producerRecord);
        }
        kafkaTemplate.flush();
    }

    public void create(TopicData newTopic, String serverId) throws KouncilRuntimeException {
        log.info("Create new topic with name={}", newTopic.getName());
        try {
            CreateTopicsResult topics = kafkaConnectionService.getAdminClient(serverId).createTopics(List.of(
                    new NewTopic(newTopic.getName(), newTopic.getPartitions(), newTopic.getReplicationFactor())
            ));

            topics.all().get();
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e.getMessage());
        }
    }

    public void updateTopicPartitions(TopicData newTopic, String serverId) {
        log.info("Updating topic={} partitions", newTopic.getName());
        kafkaConnectionService.getAdminClient(serverId).createPartitions(Map.of(newTopic.getName(), NewPartitions.increaseTo(newTopic.getPartitions())));
    }

    public TopicData getTopicData(String topicName, String serverId) {
        log.info("Get topic={} from server={}", topicName, serverId);
        DescribeTopicsResult describeTopicsResult = kafkaConnectionService.getAdminClient(serverId).describeTopics(List.of(topicName));
        TopicData topicData;
        try {
            TopicDescription topicDescription = describeTopicsResult.allTopicNames().get().get(topicName);
            topicData = new TopicData(topicDescription.name(), topicDescription.partitions().size(),
                    (short) topicDescription.partitions().get(0).replicas().size());
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e.getMessage());
        }
        return topicData;
    }

    public void removeTopic(String topicName, String serverId) {
        log.info("Delete topic={}", topicName);
        DeleteTopicsResult deleteTopicsResult = kafkaConnectionService.getAdminClient(serverId).deleteTopics(List.of(topicName));
        try {
            deleteTopicsResult.all().get();
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e.getMessage());
        }
    }
}
