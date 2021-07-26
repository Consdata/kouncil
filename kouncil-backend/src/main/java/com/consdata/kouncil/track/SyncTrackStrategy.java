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
        if (messageList.size() > 5000) {
            log.warn("Result to large for browser to handle!");
            messageList = messageList.subList(0, 5000);
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
