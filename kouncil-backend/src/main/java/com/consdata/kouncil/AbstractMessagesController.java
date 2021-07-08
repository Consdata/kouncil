package com.consdata.kouncil;

import com.consdata.kouncil.topic.TopicMessageHeader;
import lombok.AllArgsConstructor;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.header.Header;
import org.apache.kafka.common.header.Headers;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;

@AllArgsConstructor
public class AbstractMessagesController {

    protected static final int POLL_TIMEOUT = 100;
    protected final KafkaConnectionService kafkaConnectionService;

    protected Map<Integer, Long> calculateEndOffsets(Long endTimestampMillis, KafkaConsumer<String, String> consumer, Collection<TopicPartition> topicPartitions) {
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

    protected Map<Integer, Long> calculateBeginningOffsets(Long beginningTimestampMillis, KafkaConsumer<String, String> consumer, Collection<TopicPartition> topicPartitions) {
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

    protected List<TopicMessageHeader> mapHeaders(Headers headers) {
        List<TopicMessageHeader> result = new ArrayList<>();
        for (Header header : headers) {
            result.add(TopicMessageHeader.builder()
                    .key(header.key())
                    .value(header.value() == null ? null : new String(header.value()))
                    .build());
        }
        return result;
    }

    protected void validateTopics(String serverId, List<String> topicNames) {
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
