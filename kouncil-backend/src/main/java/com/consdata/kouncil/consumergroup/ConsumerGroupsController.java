package com.consdata.kouncil.consumergroup;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.ConsumerGroupDescription;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.admin.ListConsumerGroupsResult;
import org.apache.kafka.common.KafkaFuture;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
public class ConsumerGroupsController {

    private final KafkaConnectionService kafkaConnectionService;

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_LIST)
    @GetMapping("/api/consumer-groups")
    public ConsumerGroupsResponse getConsumerGroups(@RequestParam("serverId") String serverId) throws ExecutionException, InterruptedException {
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
}
