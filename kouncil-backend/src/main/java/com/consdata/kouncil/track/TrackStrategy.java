package com.consdata.kouncil.track;

import com.consdata.kouncil.topic.TopicMessage;

import java.util.List;

public interface TrackStrategy {

    int EVENTS_SANITY_LIMIT = 1000;
    boolean shouldStopTracking();

    void processCandidates(List<TopicMessage> candidates);

    List<TopicMessage> processFinalResult();

}
