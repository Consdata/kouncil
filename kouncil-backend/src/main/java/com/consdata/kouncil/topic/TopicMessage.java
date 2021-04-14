package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicMessage {

    private String key;
    private String value;
    private long timestamp;
    private int partition;
    private long offset;
}
