package com.consdata.kouncil.consumergroup;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilConfiguration;
import lombok.AllArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
public class ConsumerGroupController {

    private final KafkaConnectionService kafkaConnectionService;

    private final KouncilConfiguration kouncilConfiguration;

    @GetMapping("/api/consumer-groups")
    public ConsumerGroupsResponse getConsumerGroups() throws ExecutionException, InterruptedException {
        ConsumerGroupsResponse result = ConsumerGroupsResponse
                .builder()
                .consumerGroups(new ArrayList<>())
                .build();
        String serverId = "kouncil_consdata_local_8001"; //TODO: JG

        ListConsumerGroupsResult groups = kafkaConnectionService.getAdminClient(serverId).listConsumerGroups();
        List<String> groupIds = groups.all().get().stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList());
        Map<String, KafkaFuture<ConsumerGroupDescription>> consumerGroupSummary = kafkaConnectionService.getAdminClient(serverId).describeConsumerGroups(groupIds).describedGroups();
        for (Map.Entry<String, KafkaFuture<ConsumerGroupDescription>> entry : consumerGroupSummary.entrySet()) {
            result.getConsumerGroups().add(ConsumerGroup.builder().groupId(entry.getKey()).status(entry.getValue().get().state().toString()).build());
        }
        return result;
    }

    @GetMapping("/api/consumer-group/{groupId}")
    public ConsumerGroupResponse getConsumerGroup(
            @PathVariable("groupId") String groupId) throws ExecutionException, InterruptedException {

        ConsumerGroupResponse result = ConsumerGroupResponse.builder().consumerGroupOffset(new ArrayList<>()).build();
        String serverId = "kouncil_consdata_local_8001"; //TODO: JG
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
                member.assignment().topicPartitions().forEach((assignment -> {
                    result.getConsumerGroupOffset().forEach(o -> {
                        if (o.getKey().equals(assignment)) {
                            o.setClientId(member.clientId());
                            o.setConsumerId(member.consumerId());
                            o.setHost(member.host());
                        }
                    });
                })));

        try (KafkaConsumer<String, String> kafkaConsumer = createConsumer()) {
            Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(result.getConsumerGroupOffset().stream().map(ConsumerGroupOffset::getKey).collect(Collectors.toList()));
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

    @DeleteMapping("/api/consumer-group/{groupId}")
    public void deleteConsumerGroup(
            @PathVariable("groupId") String groupId) {
        String serverId = "kouncil_consdata_local_8001"; //TODO: JG
        kafkaConnectionService.getAdminClient(serverId).deleteConsumerGroups(Collections.singletonList(groupId));
    }

    private KafkaConsumer<String, String> createConsumer() {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kouncilConfiguration.getInitialBootstrapServers());
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        return new KafkaConsumer<>(props);
    }
}
