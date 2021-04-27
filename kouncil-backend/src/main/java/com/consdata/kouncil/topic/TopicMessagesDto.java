package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;
import lombok.Singular;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TopicMessagesDto {

    @Singular
    private List<TopicMessage> messages;

    private Map<Integer, Long> partitionOffsets;

    private Map<Integer, Long> partitionEndOffsets;

    private Long totalResults;
}
