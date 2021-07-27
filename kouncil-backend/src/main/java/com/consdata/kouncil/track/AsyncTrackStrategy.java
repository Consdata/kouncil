package com.consdata.kouncil.track;

import com.consdata.kouncil.topic.TopicMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Slf4j
public class AsyncTrackStrategy implements TrackStrategy {

    private final SimpMessagingTemplate eventSender;
    private final String destination;
    private final DestinationStore destinationStore;

    public AsyncTrackStrategy(String destination, SimpMessagingTemplate eventSender, DestinationStore destinationStore) {
        this.eventSender = eventSender;
        this.destination = destination;
        this.destinationStore = destinationStore;
    }

    @Override
    public boolean shouldStopTracking() {
        if (destinationStore.destinationIsActive(destination)) {
            return false;
        } else {
            log.warn("Client disconnection detected destination={}", destination);
            return true;
        }
    }

    @Override
    public void processCandidates(List<TopicMessage> candidates) {
        if (!candidates.isEmpty()) {
            candidates.sort(Comparator.comparing(TopicMessage::getTimestamp));
            log.debug("TRACK91 async batch send destination={}, size={}", destination, candidates.size());
            eventSender.convertAndSend(destination, candidates);
        }
    }

    @Override
    public List<TopicMessage> processFinalResult() {
        //sending empty list just to notify frontent about end of processing
        eventSender.convertAndSend(destination, Collections.emptyList());
        return Collections.emptyList();
    }
}
