package com.consdata.kouncil.consumergroup;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ConsumerGroupsResponse {
    private List<ConsumerGroup> consumerGroups;
}
