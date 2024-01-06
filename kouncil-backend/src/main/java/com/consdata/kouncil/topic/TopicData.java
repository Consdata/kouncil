package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;
import lombok.ToString;

@Data
@Builder
@ToString
public class TopicData {

    private String name;
    private int partitions;
    private short replicationFactor;
}
