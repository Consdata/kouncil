package com.consdata.kouncil.topic;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsOptions;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TopicsService {

    private final KafkaConnectionService kafkaConnectionService;

    @Value("${kouncil.topics.exclude-regex-patterns:}")
    private List<String> excludePatterns;

    public TopicsDto getTopics(String serverId) {
        try {
            AdminClient adminClient = kafkaConnectionService.getAdminClient(serverId);
            ListTopicsResult listTopicsResult = adminClient.listTopics(new ListTopicsOptions().listInternal(true));
            Set<String> allTopicNames = listTopicsResult.names().get();
            Set<String> filteredTopicNames = allTopicNames.stream().filter(this::notOnExcludedList).collect(Collectors.toSet());
            Map<String, TopicDescription> topicDescriptions = adminClient.describeTopics(filteredTopicNames).allTopicNames().get();
            List<TopicMetadata> topics = new ArrayList<>();
            topicDescriptions.forEach((k, v) -> topics.add(TopicMetadata.builder().name(k).partitions(v.partitions().size()).build()));
            Collections.sort(topics);
            return TopicsDto.builder().topics(topics).build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e);
        } catch (ExecutionException e) {
            throw new KouncilRuntimeException(e);
        }
    }

    private boolean notOnExcludedList(String topicName) {
        return excludePatterns.stream().noneMatch(s -> Pattern.matches(s, topicName));
    }
}
