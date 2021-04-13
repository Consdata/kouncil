package com.consdata.kouncil.consumergroup;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsumerGroupResponse {
	private List<ConsumerGroupOffset> consumerGroupOffset;
}
