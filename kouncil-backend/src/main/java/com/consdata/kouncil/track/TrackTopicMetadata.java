package com.consdata.kouncil.track;

import lombok.Builder;
import lombok.Data;
import org.apache.kafka.common.TopicPartition;

import java.util.Map;

@Data
@Builder
public class TrackTopicMetadata {
    private String topicName;
    private Map<Integer, TopicPartition> partitions; // (index, metadata)
    private Map<Integer, Long> beginningOffsets; // (index, beginning offset)
    private Map<Integer, Long> endOffsets; // (index, end offset)
    private Long trackSize;
}
