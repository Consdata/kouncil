package com.consdata.kouncil.topic;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicMetadata implements Comparable<TopicMetadata> {
    private String name;
    private int partitions;

    @Override
    public int compareTo(TopicMetadata o) {
        return name.compareTo(o.getName());
    }
}
