package com.consdata.kouncil.consumergroup;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.ListConsumerGroupsResult;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
public class ConsumerGroupController {

    private final KafkaConnectionService kafkaConnectionService;

    private final KouncilConfiguration kouncilConfiguration;

    @RolesAllowed(Fields.CONSUMER_GROUP_LIST)
    @GetMapping("/api/consumer-groups")
    public ConsumerGroupsResponse getConsumerGroups(@RequestParam("serverId") String serverId) throws ExecutionException, InterruptedException {
        ConsumerGroupsResponse result = ConsumerGroupsResponse
                .builder()
                .consumerGroups(new ArrayList<>())
                .build();
        ListConsumerGroupsResult groups = kafkaConnectionService.getAdminClient(serverId).listConsumerGroups();
        List<String> groupIds = groups.all().get().stream().map(ConsumerGroupListing::groupId).toList();
        Map<String, KafkaFuture<ConsumerGroupDescription>> consumerGroupSummary = kafkaConnectionService.getAdminClient(serverId).describeConsumerGroups(groupIds).describedGroups();
        for (Map.Entry<String, KafkaFuture<ConsumerGroupDescription>> entry : consumerGroupSummary.entrySet()) {
            result.getConsumerGroups().add(ConsumerGroup.builder().groupId(entry.getKey()).status(entry.getValue().get().state().toString()).build());
        }
        return result;
    }

    @RolesAllowed(Fields.CONSUMER_GROUP_DETAILS)
    @GetMapping("/api/consumer-group/{groupId}")
    public ConsumerGroupResponse getConsumerGroup(
            @PathVariable("groupId") String groupId,
            @RequestParam("serverId") String serverId) throws ExecutionException, InterruptedException {
        ConsumerGroupResponse result = ConsumerGroupResponse.builder().consumerGroupOffset(new ArrayList<>()).build();
        Map<TopicPartition, OffsetAndMetadata> offsets = kafkaConnectionService.getAdminClient(serverId).listConsumerGroupOffsets(groupId).partitionsToOffsetAndMetadata().get();
        offsets.forEach((tp, omd) -> result
                .getConsumerGroupOffset()
                .add(ConsumerGroupOffset
                        .builder()
                        .key(tp)
                        .topic(tp.topic())
                        .partition(tp.partition())
                        .offset(omd.offset())
                        .build()));

        ConsumerGroupDescription consumerGroupSummary = kafkaConnectionService.getAdminClient(serverId).describeConsumerGroups(Collections.singletonList(groupId)).describedGroups().get(groupId).get();

        consumerGroupSummary.members().forEach(member ->
                member.assignment().topicPartitions().forEach((assignment -> result.getConsumerGroupOffset().forEach(o -> {
                    if (o.getKey().equals(assignment)) {
                        o.setClientId(member.clientId());
                        o.setConsumerId(member.consumerId());
                        o.setHost(member.host());
                    }
                }))));

        try (KafkaConsumer<String, String> kafkaConsumer = createConsumer(serverId)) {
            List<TopicPartition> partitions = result.getConsumerGroupOffset().stream().map(ConsumerGroupOffset::getKey).toList();
            Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(partitions);
            result.getConsumerGroupOffset().forEach(consumerGroupOffset -> {
                String topic = consumerGroupOffset.getTopic();
                int partition = consumerGroupOffset.getPartition();
                consumerGroupOffset.setEndOffset(endOffsets.getOrDefault(new TopicPartition(
                        topic,
                        partition), null));
            });
        }
        return result;
    }

    @RolesAllowed(Fields.CONSUMER_GROUP_DELETE)
    @DeleteMapping("/api/consumer-group/{groupId}")
    public void deleteConsumerGroup(
            @PathVariable("groupId") String groupId,
            @RequestParam("serverId") String serverId) {
        kafkaConnectionService.getAdminClient(serverId).deleteConsumerGroups(Collections.singletonList(groupId));
    }

    private KafkaConsumer<String, String> createConsumer(String serverId) {
        Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildConsumerProperties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kouncilConfiguration.getServerByClusterId(serverId));
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        return new KafkaConsumer<>(props);
    }
}
