package com.consdata.kouncil;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsumerGroupsResponse {
	private List<ConsumerGroup> consumerGroups;
}
