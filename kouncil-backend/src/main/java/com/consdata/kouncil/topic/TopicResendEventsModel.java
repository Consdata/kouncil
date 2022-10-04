package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@Builder
@ToString
public class TopicResendEventsModel {
    private String sourceTopicName;
    private Integer sourceTopicPartition;
    private Long offsetBeginning;
    private Long offsetEnd;
    private String destinationTopicName;
    private Integer destinationTopicPartition;

    public Integer getDestinationTopicPartition() {
        return destinationTopicPartition < 0 ? null : destinationTopicPartition;
    }
}
