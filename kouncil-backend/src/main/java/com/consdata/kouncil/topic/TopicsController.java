package com.consdata.kouncil.topic;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeTopicsResult;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
public class TopicsController {

    private final KafkaConnectionService kafkaConnectionService;

    @GetMapping("/api/topics")
    @EntryExitLogger
    public TopicsDto getTopics() {
        try {
            String serverId = "kouncil_consdata_local_8001"; //TODO: JG
            AdminClient adminClient = kafkaConnectionService.getAdminClient(serverId);
            ListTopicsResult listTopicsResult = adminClient.listTopics();
            List<String> children = new ArrayList<>(listTopicsResult.names().get());
            Collections.sort(children);
            // XXX: optimization: describe all topics in one call
            List<TopicMetadata> topics = children.stream().map(name -> getTopicMetadata(name, adminClient)).collect(Collectors.toList());
            return TopicsDto.builder().topics(topics).build();
        } catch (Exception e) {
            throw new KouncilRuntimeException(e);
        }
    }

    private TopicMetadata getTopicMetadata(String name, AdminClient adminClient) {
        try {
            DescribeTopicsResult describeTopicsResult = adminClient.describeTopics(Collections.singletonList(name));
            Map<String, TopicDescription> topics = describeTopicsResult.all().get();
            TopicDescription topicDescription = topics.get(name);
            int partitions = -1;
            if (topicDescription != null) {
                partitions = topicDescription.partitions().size();
            }
            return TopicMetadata.builder().name(name).partitions(partitions).build();
        } catch (Exception e) {
            throw new KouncilRuntimeException(e);
        }
    }

}
