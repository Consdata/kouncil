package com.consdata.kouncil.consumergroup;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import java.util.concurrent.ExecutionException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/consumer-group")
public class ConsumerGroupController {

    private final ConsumerGroupService consumerGroupService;

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_LIST)
    @GetMapping
    public ConsumerGroupsResponse getConsumerGroups(@RequestParam("serverId") String serverId) throws ExecutionException, InterruptedException {
        return consumerGroupService.getConsumerGroups(serverId);
    }

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_DETAILS)
    @GetMapping("/{groupId}")
    public ConsumerGroupResponse getConsumerGroup(@PathVariable("groupId") String groupId, @RequestParam("serverId") String serverId)
            throws ExecutionException, InterruptedException {
        return consumerGroupService.getConsumerGroup(groupId, serverId);
    }

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_DELETE)
    @DeleteMapping("/{groupId}")
    public void deleteConsumerGroup(@PathVariable("groupId") String groupId, @RequestParam("serverId") String serverId) {
        consumerGroupService.deleteConsumerGroup(groupId, serverId);
    }

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_DETAILS)
    @PostMapping("/{groupId}/reset")
    public void resetOffset(@PathVariable("groupId") String groupId,
            @RequestBody ConsumerGroupResetDto consumerGroupResetDto) throws ExecutionException, InterruptedException {
        consumerGroupService.resetOffset(groupId, consumerGroupResetDto);
    }
}
