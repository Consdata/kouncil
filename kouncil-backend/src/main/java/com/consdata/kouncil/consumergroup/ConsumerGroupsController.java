package com.consdata.kouncil.consumergroup;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import java.util.concurrent.ExecutionException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/consumer-groups")
public class ConsumerGroupsController {

    private final ConsumerGroupService consumerGroupService;

    @RolesAllowed(SystemFunctionNameConstants.CONSUMER_GROUP_LIST)
    @GetMapping
    public ConsumerGroupsResponse getConsumerGroups(@RequestParam("serverId") String serverId) throws ExecutionException, InterruptedException {
        if (serverId != null && !serverId.isBlank()) {
            return consumerGroupService.getConsumerGroups(serverId);
        }
        throw new KouncilRuntimeException("Clusters are not defined. Please register new clusters or reach out to your administrator for further information.");
    }
}
