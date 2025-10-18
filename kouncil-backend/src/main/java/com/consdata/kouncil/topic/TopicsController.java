package com.consdata.kouncil.topic;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@SuppressWarnings("java:S6212") //val
public class TopicsController {

    private final TopicsService topicsService;

    @RolesAllowed(SystemFunctionNameConstants.TOPIC_LIST)
    @GetMapping("/api/topics")
    @EntryExitLogger
    public TopicsDto getTopics(@RequestParam("serverId") String serverId) {
        if (serverId != null && !serverId.isBlank()) {
            return topicsService.getTopics(serverId);
        }
        throw new KouncilRuntimeException("Clusters are not defined. Please register new clusters or reach out to your administrator for further information.");
    }
}
