package com.consdata.kouncil.track;

import lombok.Builder;
import lombok.Data;
import org.apache.kafka.common.TopicPartition;

import java.util.Map;

@Data
@Builder
@SuppressWarnings("java:S6212") //val
public class TopicMetadata {
    private String topicName;
    private Map<Integer, TopicPartition> partitions; // (index, metadata)
    private Map<Integer, Long> beginningOffsets; // (index, beginning offset)
    private Map<Integer, Long> endOffsets; // (index, end offset)
    private Long trackSize;

    public Long getPartitionRangeSize(Integer partition) {
        return endOffsets.get(partition) - beginningOffsets.get(partition);
    }

    public Long getAllPartitionRangeSize() {
        long size = 0L;
        for (Integer key : partitions.keySet()) {
            size += getPartitionRangeSize(key);
        }
        return size;
    }
}
