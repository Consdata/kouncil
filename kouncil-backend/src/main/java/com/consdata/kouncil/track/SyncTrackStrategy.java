package com.consdata.kouncil.track;

import com.consdata.kouncil.topic.TopicMessage;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
public class SyncTrackStrategy implements TrackStrategy {
    List<TopicMessage> messageList = new ArrayList<>();

    @Override
    public boolean shouldStopTracking() {
        if (messageList.size() > EVENTS_SANITY_LIMIT) {
            log.warn("Result is to large for the browser to handle!");
            messageList = messageList.subList(0, 1000);
            return true;
        } else {
            return false;
        }
    }

    @Override
    public void processCandidates(List<TopicMessage> candidates) {
        if (!candidates.isEmpty()) {
            messageList.addAll(candidates);
        }
    }

    @Override
    public List<TopicMessage> processFinalResult() {
        messageList.sort(Comparator.comparing(TopicMessage::getTimestamp));
        log.debug("TRACK99 search completed result.size={}", messageList.size());
        return messageList;
    }
}
