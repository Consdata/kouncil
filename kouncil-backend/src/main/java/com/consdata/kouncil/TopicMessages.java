package com.consdata.kouncil;

import lombok.Builder;
import lombok.Data;
import lombok.Singular;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TopicMessages {

	@Singular
	private List<Message> messages;

	private Map<Integer, Long> partitionOffsets;

	private Map<Integer, Long> partitionEndOffsets;

	private Long totalResults;
}