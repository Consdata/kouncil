package pl.tomlewlit.kafkacompanion;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ListConsumerGroupsResult;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ExecutionException;

@RestController
public class ConsumerGroupController {

    @NotNull
    private AdminClient adminClient;

    @NotNull
    private KafkaCompanionConfiguration kafkaCompanionConfiguration;

    public ConsumerGroupController(AdminClient adminClient, KafkaCompanionConfiguration kafkaCompanionConfiguration) {
        this.adminClient = adminClient;
        this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
    }

    @GetMapping("/api/consumer-groups")
    public ConsumerGroupsResponse getConsumerGroups() throws ExecutionException, InterruptedException {
        ConsumerGroupsResponse consumerGroups = ConsumerGroupsResponse
                .builder()
                .consumerGroups(new ArrayList<>())
                .build();
        ListConsumerGroupsResult groups = adminClient.listConsumerGroups();
        groups.all().get().forEach(g -> consumerGroups
                .getConsumerGroups()
                .add(ConsumerGroup.builder().groupId(g.groupId()).protocolType("").build()));
        return consumerGroups;
    }

    @GetMapping("/api/consumer-group/{groupId}/{companionGroupId}")
    public ConsumerGroupResponse getConsumerGroup(
            @PathVariable("groupId") String groupId,
            @PathVariable("companionGroupId") String companionGroupId) throws ExecutionException, InterruptedException {
        ConsumerGroupResponse consumerGroup = ConsumerGroupResponse.builder().assignments(new ArrayList<>()).build();
        Map<TopicPartition, OffsetAndMetadata> offsets = adminClient.listConsumerGroupOffsets(groupId).partitionsToOffsetAndMetadata().get();
        ConsumerGroupDescription consumerGroupSummary = adminClient.describeConsumerGroups(Collections.singletonList(groupId)).describedGroups().get(groupId).get();
        java.util.List<org.apache.kafka.common.TopicPartition> allTopicPartitions = new java.util.ArrayList<>();
        consumerGroupSummary.members().forEach(kafkaConsumer ->
                kafkaConsumer.assignment().topicPartitions().forEach((kafkaTopicPartition -> {
                    allTopicPartitions.add(kafkaTopicPartition);
                    OffsetAndMetadata offsetAndMetadata = offsets.get(kafkaTopicPartition);
                    consumerGroup
                            .getAssignments()
                            .add(Assignment
                                    .builder()
                                    .clientId(kafkaConsumer.clientId())
                                    .consumerId(kafkaConsumer.consumerId())
                                    .host(kafkaConsumer.host())
                                    .topic(kafkaTopicPartition.topic())
                                    .partition(kafkaTopicPartition.partition())
                                    .offset(offsetAndMetadata.offset())
                                    .build());
                })));

        try (KafkaConsumer<String, String> kafkaConsumer = createConsumer(companionGroupId)) {
            Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(
                    allTopicPartitions);
            consumerGroup.getAssignments().forEach(assignment -> {
                String topic = assignment.getTopic();
                int partition = assignment.getPartition();
                assignment.setEndOffset(endOffsets.getOrDefault(new TopicPartition(
                        topic,
                        partition), null));
            });
        }


        return consumerGroup;
    }

    private KafkaConsumer<String, String> createConsumer(String groupId) {
        Properties props = new Properties();
        props.put("bootstrap.servers", kafkaCompanionConfiguration.getBootstrapServers());
        props.put("group.id", groupId);
        props.put("key.deserializer", StringDeserializer.class.getName());
        props.put("value.deserializer", StringDeserializer.class.getName());

        return new KafkaConsumer<>(props);
    }
}
