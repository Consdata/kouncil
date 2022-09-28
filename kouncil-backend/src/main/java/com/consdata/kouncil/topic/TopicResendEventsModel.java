package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicResendEventsModel {
    private String sourceTopicName;
    private int sourceTopicPartition;
    private int offsetBeginning;
    private int offsetEnd;
    private String destinationTopicName;
    private int destinationTopicPartition;
}
