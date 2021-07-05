package com.consdata.kouncil.topic;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
public class TopicsController {

    private final KafkaConnectionService kafkaConnectionService;

    @GetMapping("/api/topics")
    @EntryExitLogger
    public TopicsDto getTopics(@RequestParam("serverId") String serverId) {
        try {
            AdminClient adminClient = kafkaConnectionService.getAdminClient(serverId);
            ListTopicsResult listTopicsResult = adminClient.listTopics();
            Map<String, TopicDescription> topicDescriptions = adminClient.describeTopics(listTopicsResult.names().get()).all().get();
            List<TopicMetadata> topics = new ArrayList<>();
            topicDescriptions.forEach((k, v) -> topics.add(TopicMetadata.builder().name(k).partitions(v.partitions().size()).build()));
            Collections.sort(topics);
            return TopicsDto.builder().topics(topics).build();
        } catch (Exception e) {
            throw new KouncilRuntimeException(e);
        }
    }
}
