package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TopicMessage {

    private List<TopicMessageHeader> headers;
    private String key;
    private String value;
    private long timestamp;
    private int partition;
    private long offset;
    private String topic;
}
