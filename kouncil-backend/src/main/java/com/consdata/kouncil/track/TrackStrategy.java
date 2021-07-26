package com.consdata.kouncil.track;

import com.consdata.kouncil.topic.TopicMessage;

import java.util.List;

public interface TrackStrategy {
    boolean shouldStopTracking();

    void processCandidates(List<TopicMessage> candidates);

    List<TopicMessage> processFinalResult();

}
