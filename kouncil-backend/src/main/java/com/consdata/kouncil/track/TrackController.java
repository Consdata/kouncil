package com.consdata.kouncil.track;

import com.consdata.kouncil.topic.TopicMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.config.WebSocketMessageBrokerStats;

import java.util.List;
import java.util.concurrent.ExecutorService;

@Slf4j
@RestController
@RequiredArgsConstructor
@SuppressWarnings("java:S6212") //val
public class TrackController {

    private final SimpMessagingTemplate eventSender;

    private final ExecutorService executor;

    private final WebSocketMessageBrokerStats webSocketMessageBrokerStats;

    private final DestinationStore destinationStore;

    private final TrackService trackService;

    @GetMapping("/api/track/stats")
    public String printStats() throws JsonProcessingException {
        WebSocketStats wss = WebSocketStats.builder()
                .wsSession(webSocketMessageBrokerStats.getWebSocketSessionStatsInfo())
                .taskScheduler(webSocketMessageBrokerStats.getSockJsTaskSchedulerStatsInfo())
                .clientInbound(webSocketMessageBrokerStats.getClientInboundExecutorStatsInfo())
                .clientOutbound(webSocketMessageBrokerStats.getClientOutboundExecutorStatsInfo())
                .destinations(destinationStore.getActiveDestinations())
                .build();
        String result = new ObjectMapper().writeValueAsString(wss);
        log.debug(result);
        return result;
    }

    @GetMapping("/api/track/sync")
    public List<TopicMessage> getSync(@RequestParam("topicNames") List<String> topicNames,
                                      @RequestParam("field") String field,
                                      @RequestParam("operator") String operatorParam,
                                      @RequestParam("value") String value,
                                      @RequestParam("beginningTimestampMillis") Long beginningTimestampMillis,
                                      @RequestParam("endTimestampMillis") Long endTimestampMillis,
                                      @RequestParam("serverId") String serverId) {
        return trackService.getEvents(topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId, new SyncTrackStrategy());
    }

    @GetMapping("/api/track/async")
    public void getAsync(@RequestParam("topicNames") List<String> topicNames,
                         @RequestParam("field") String field,
                         @RequestParam("operator") String operatorParam,
                         @RequestParam("value") String value,
                         @RequestParam("beginningTimestampMillis") Long beginningTimestampMillis,
                         @RequestParam("endTimestampMillis") Long endTimestampMillis,
                         @RequestParam("serverId") String serverId,
                         @RequestParam("asyncHandle") String asyncHandle) {
        executor.submit(() -> trackService.getEvents(topicNames, field, operatorParam, value, beginningTimestampMillis, endTimestampMillis, serverId,
                new AsyncTrackStrategy("/topic/track/" + asyncHandle, eventSender, destinationStore)));
    }
}
