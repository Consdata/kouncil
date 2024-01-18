package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicData {

    private String name;
    private int partitions;
    private short replicationFactor;
}
