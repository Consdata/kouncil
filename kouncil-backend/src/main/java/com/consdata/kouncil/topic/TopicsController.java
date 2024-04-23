package com.consdata.kouncil.topic;

import static com.consdata.kouncil.config.security.RoleNames.EDITOR_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.VIEWER_ROLE;

import com.consdata.kouncil.logging.EntryExitLogger;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@SuppressWarnings("java:S6212") //val
public class TopicsController {

    private final TopicsService topicsService;

    @RolesAllowed({EDITOR_ROLE, VIEWER_ROLE})
    @GetMapping("/api/topics")
    @EntryExitLogger
    public TopicsDto getTopics(@RequestParam("serverId") String serverId) {
        return topicsService.getTopics(serverId);
    }
}
