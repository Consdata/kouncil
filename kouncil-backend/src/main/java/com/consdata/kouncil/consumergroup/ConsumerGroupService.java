package com.consdata.kouncil.consumergroup;

import static com.consdata.kouncil.consumergroup.ConsumerGroupResetType.OFFSET_NUMBER;
import static com.consdata.kouncil.consumergroup.ConsumerGroupResetType.TIMESTAMP;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.KouncilConfiguration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.ListConsumerGroupsResult;
import org.apache.kafka.clients.admin.ListOffsetsResult.ListOffsetsResultInfo;
import org.apache.kafka.clients.admin.OffsetSpec;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConsumerGroupService {

    private final KafkaConnectionService kafkaConnectionService;

    private final KouncilConfiguration kouncilConfiguration;

    public ConsumerGroupsResponse getConsumerGroups(String serverId) throws ExecutionException, InterruptedException {
        ConsumerGroupsResponse result = ConsumerGroupsResponse
                .builder()
                .consumerGroups(new ArrayList<>())
                .build();
        ListConsumerGroupsResult groups = kafkaConnectionService.getAdminClient(serverId).listConsumerGroups();
        List<String> groupIds = groups.all().get().stream().map(ConsumerGroupListing::groupId).toList();
        Map<String, KafkaFuture<ConsumerGroupDescription>> consumerGroupSummary = kafkaConnectionService.getAdminClient(serverId)
                .describeConsumerGroups(groupIds).describedGroups();
        for (Map.Entry<String, KafkaFuture<ConsumerGroupDescription>> entry : consumerGroupSummary.entrySet()) {
            result.getConsumerGroups().add(ConsumerGroup.builder().groupId(entry.getKey()).status(entry.getValue().get().state().toString()).build());
        }
        return result;
    }

    public ConsumerGroupResponse getConsumerGroup(String groupId, String serverId) throws ExecutionException, InterruptedException {
        ConsumerGroupResponse result = ConsumerGroupResponse.builder().consumerGroupOffset(new ArrayList<>()).build();
        Map<TopicPartition, OffsetAndMetadata> offsets = kafkaConnectionService.getAdminClient(serverId).listConsumerGroupOffsets(groupId)
                .partitionsToOffsetAndMetadata().get();
        offsets.forEach((tp, omd) -> result
                .getConsumerGroupOffset()
                .add(ConsumerGroupOffset.builder()
                        .key(tp)
                        .topic(tp.topic())
                        .partition(tp.partition())
                        .offset(omd.offset())
                        .build()
                )
        );

        ConsumerGroupDescription consumerGroupSummary = kafkaConnectionService.getAdminClient(serverId)
                .describeConsumerGroups(Collections.singletonList(groupId)).describedGroups().get(groupId).get();

        consumerGroupSummary.members().forEach(member ->
                member.assignment().topicPartitions().forEach((assignment -> result.getConsumerGroupOffset().forEach(o -> {
                    if (o.getKey().equals(assignment)) {
                        o.setClientId(member.clientId());
                        o.setConsumerId(member.consumerId());
                        o.setHost(member.host());
                    }
                }))));

        try (KafkaConsumer<String, String> kafkaConsumer = createConsumer(serverId, groupId)) {
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

    public void deleteConsumerGroup(String groupId, String serverId) {
        kafkaConnectionService.getAdminClient(serverId).deleteConsumerGroups(Collections.singletonList(groupId));
    }


    public void resetOffset(String groupId, ConsumerGroupResetDto consumerGroupResetDto) throws ExecutionException, InterruptedException {
        String serverId = consumerGroupResetDto.serverId();
        ConsumerGroupResetType resetType = consumerGroupResetDto.resetType();

        AdminClient adminClient = kafkaConnectionService.getAdminClient(serverId);

        ConsumerGroupDescription consumerGroupDescription = adminClient.describeConsumerGroups(Collections.singletonList(groupId))
                .all()
                .get()
                .get(groupId);

        if (!consumerGroupDescription.members().isEmpty()) {
            throw new KouncilRuntimeException(String.format(
                    "Cannot reset offsets: consumer group %s has active consumers. Please stop all consumers in this group before performing an offset reset.",
                    groupId));
        }

        Map<TopicPartition, OffsetAndMetadata> currentOffsets = adminClient
                .listConsumerGroupOffsets(groupId)
                .partitionsToOffsetAndMetadata().get();

        Map<TopicPartition, OffsetSpec> offsetSpecs = new HashMap<>();
        switch (resetType) {
            case EARLIEST -> currentOffsets.keySet().forEach(tp -> offsetSpecs.put(tp, OffsetSpec.earliest()));
            case LATEST -> currentOffsets.keySet().forEach(tp -> offsetSpecs.put(tp, OffsetSpec.latest()));
            case TIMESTAMP -> currentOffsets.keySet().forEach(tp -> offsetSpecs.put(tp, OffsetSpec.forTimestamp(consumerGroupResetDto.timestampMillis())));
        }

        Map<TopicPartition, OffsetAndMetadata> offsetsToCommit = new HashMap<>();

        if (!offsetSpecs.isEmpty()) {
            Map<TopicPartition, ListOffsetsResultInfo> result = adminClient.listOffsets(offsetSpecs).all().get();
            for (Map.Entry<TopicPartition, ListOffsetsResultInfo> entry : result.entrySet()) {
                long offset = entry.getValue().offset();
                if (offset < 0 && TIMESTAMP.equals(resetType)) {
                    offset = adminClient.listOffsets(Map.of(entry.getKey(), OffsetSpec.latest())).all().get().get(entry.getKey()).offset();
                }
                offsetsToCommit.put(entry.getKey(), new OffsetAndMetadata(offset));
            }
        }

        if (OFFSET_NUMBER.equals(resetType)) {
            currentOffsets.keySet().forEach(tp -> offsetsToCommit.put(tp, new OffsetAndMetadata(consumerGroupResetDto.offsetNo())));
        }

        adminClient.alterConsumerGroupOffsets(groupId, offsetsToCommit).all().get();
    }


    private KafkaConsumer<String, String> createConsumer(String serverId, String groupId) {
        Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildConsumerProperties(null);
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kouncilConfiguration.getServerByClusterId(serverId));
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        return new KafkaConsumer<>(props);
    }
}
