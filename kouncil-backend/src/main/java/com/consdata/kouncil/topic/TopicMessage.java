package com.consdata.kouncil.topic;

import com.consdata.kouncil.serde.MessageFormat;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicMessage {

    private List<TopicMessageHeader> headers;
    private String key;
    private MessageFormat keyFormat;
    private String value;
    private String originalValue;
    private MessageFormat valueFormat;
    private long timestamp;
    private int partition;
    private long offset;
    private String topic;
}
