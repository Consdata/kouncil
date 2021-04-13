package com.consdata.kouncil;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicMetadata {
	private String name;
	private int partitions;
}
