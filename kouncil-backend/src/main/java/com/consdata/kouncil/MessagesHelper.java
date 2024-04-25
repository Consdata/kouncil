package com.consdata.kouncil;

import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.serialization.SerializationService;
import com.consdata.kouncil.topic.TopicMessageHeader;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.kafka.retrytopic.RetryTopicHeaders;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.stereotype.Component;

@AllArgsConstructor
@SuppressWarnings("java:S6212") //val
@Component
public class MessagesHelper {

    protected final KafkaConnectionService kafkaConnectionService;
    protected final SerializationService serializationService;
    protected final DeserializationService deserializationService;

    public Map<Integer, Long> calculateEndOffsets(Long endTimestampMillis, Long offset, KafkaConsumer<Bytes, Bytes> consumer, Collection<TopicPartition> topicPartitions) {
        final Map<Integer, Long> endOffsets;
        final Map<Integer, Long> globalEndOffsets = consumer.endOffsets(topicPartitions).entrySet()
                .stream().collect(Collectors.toMap(k -> k.getKey().partition(), Map.Entry::getValue));
        if (offset != null) {
            return topicPartitions.stream().map(TopicPartition::partition).collect(Collectors.toMap(p -> p, p -> offset + 1));
        } else if (endTimestampMillis != null) {
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

    public Map<Integer, Long> calculateBeginningOffsets(
            Long beginningTimestampMillis,
            Long offset,
            KafkaConsumer<Bytes, Bytes> consumer,
            Collection<TopicPartition> topicPartitions) {
        Map<Integer, Long> beginningOffsets;
        if (offset != null) {
            return topicPartitions.stream().map(TopicPartition::partition).collect(Collectors.toMap(p -> p, p -> offset));
        } else if (beginningTimestampMillis != null) {
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

    /*
     * The reason of this headers value transformation function
     * is that Spring Boot cannot properly deal with dlq original headers
     * when the data comes in Long or Integer format (ex. timestamp, partition, offset).
     * So we need to modify data to String format.
     */
    private String transformHeaderValue(Header header) {
        String headerValue = null;
        if (header.value() != null) {
            ByteBuffer byteBuffer = ByteBuffer.wrap(header.value());
            if (List.of(KafkaHeaders.DLT_ORIGINAL_TIMESTAMP, KafkaHeaders.DLT_ORIGINAL_OFFSET, KafkaHeaders.ORIGINAL_TIMESTAMP, KafkaHeaders.ORIGINAL_OFFSET)
                    .contains(header.key())) {
                headerValue = Long.toString(byteBuffer.getLong());
            } else if (List.of(KafkaHeaders.DLT_ORIGINAL_PARTITION, KafkaHeaders.ORIGINAL_PARTITION, RetryTopicHeaders.DEFAULT_HEADER_ATTEMPTS)
                    .contains(header.key())) {
                headerValue = Integer.toString(byteBuffer.getInt());
            } else if (List.of(RetryTopicHeaders.DEFAULT_HEADER_ORIGINAL_TIMESTAMP, RetryTopicHeaders.DEFAULT_HEADER_BACKOFF_TIMESTAMP)
                    .contains(header.key())) {
                headerValue = BigInteger.valueOf(byteBuffer.getInt()).toString();
            } else {
                headerValue = new String(byteBuffer.array(), StandardCharsets.UTF_8);
            }
        }

        return headerValue;
    }

    public List<TopicMessageHeader> mapHeaders(Headers headers) {
        List<TopicMessageHeader> result = new ArrayList<>();
        for (Header header : headers) {
            String headerValue = transformHeaderValue(header);
            result.add(TopicMessageHeader.builder()
                    .key(header.key())
                    .value(headerValue)
                    .build());
        }
        return result;
    }

    public void validateTopics(String serverId, List<String> topicNames) {
        boolean topicsExists;
        try {
            topicsExists = kafkaConnectionService
                    .getAdminClient(serverId)
                    .listTopics(new ListTopicsOptions().listInternal(true))
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
