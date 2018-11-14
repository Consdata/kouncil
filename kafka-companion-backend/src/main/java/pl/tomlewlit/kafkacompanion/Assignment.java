package pl.tomlewlit.kafkacompanion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Assignment {
	private String consumerId;
	private String clientId;
	private String host;

	private int partition;
	private String topic;
	private Long offset;
	private Long endOffset;

}
