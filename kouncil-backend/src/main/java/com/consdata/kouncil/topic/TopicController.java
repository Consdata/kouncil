package com.consdata.kouncil.topic;

import static com.consdata.kouncil.config.security.RoleNames.EDITOR_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.VIEWER_ROLE;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import javax.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/topic")
public class TopicController {

    private final TopicService topicService;


    @RolesAllowed({EDITOR_ROLE, VIEWER_ROLE})
    @GetMapping("/messages/{topicName}/{partition}")
    public TopicMessagesDto getTopicMessages(@PathVariable("topicName") String topicName,
                                             @PathVariable("partition") String partitions,
                                             @RequestParam("page") String pageParam,
                                             @RequestParam("limit") String limitParam,
                                             @RequestParam(value = "beginningTimestampMillis", required = false) Long beginningTimestampMillis,
                                             @RequestParam(value = "endTimestampMillis", required = false) Long endTimestampMillis,
                                             @RequestParam(value = "offset", required = false) Long offset,
                                             @RequestParam("serverId") String serverId) {
        log.debug("TCM01 topicName={}, partitions={}, pageParam={}, limit={}, beginningTimestampMillis={}, endTimestampMillis={}",
                topicName, partitions, pageParam, limitParam, beginningTimestampMillis, endTimestampMillis);
        return topicService.getTopicMessages(topicName, partitions, pageParam, limitParam, beginningTimestampMillis, endTimestampMillis, offset, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @PostMapping("/send/{topicName}/{count}")
    @EntryExitLogger
    public void send(@PathVariable("topicName") String topicName,
                     @PathVariable("count") int count,
                     @RequestBody TopicMessage message,
                     @RequestParam("serverId") String serverId) {
        log.debug("TCS01 topicName={}, count={}, serverId={}", topicName, count, serverId);
        topicService.send(topicName, count, message, serverId);
        log.debug("TCS99 topicName={}, count={}, serverId={}", topicName, count, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @PostMapping("/resend")
    @EntryExitLogger
    public void resend(@RequestBody TopicResendEventsModel resendData,
                       @RequestParam("serverId") String serverId) {
        log.debug("TCS01 topicName={},  serverId={}, message={}", resendData.getSourceTopicName(), serverId, resendData);
        topicService.resend(resendData, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @PostMapping("/create")
    @EntryExitLogger
    public void create(@RequestBody TopicData newTopic, @RequestParam("serverId") String serverId) throws KouncilRuntimeException {
        topicService.create(newTopic, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @PutMapping("/partitions/update")
    @EntryExitLogger
    public void updateTopicPartitions(@RequestBody TopicData newTopic, @RequestParam("serverId") String serverId) throws KouncilRuntimeException {
        topicService.updateTopicPartitions(newTopic, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @GetMapping("/{topicName}")
    @EntryExitLogger
    public TopicData getTopicData(@PathVariable("topicName") String topicName, @RequestParam("serverId") String serverId) throws KouncilRuntimeException {
        return topicService.getTopicData(topicName, serverId);
    }

    @RolesAllowed({EDITOR_ROLE})
    @DeleteMapping("/{topicName}")
    @EntryExitLogger
    public void removeTopic(@PathVariable("topicName") String topicName, @RequestParam("serverId") String serverId) throws KouncilRuntimeException {
        topicService.removeTopic(topicName, serverId);
    }
}
