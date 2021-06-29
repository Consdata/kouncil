package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicMessageHeader {
    private String key;
    private String value;

}
