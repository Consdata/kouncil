package pl.tomlewlit.kafkacompanion;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConsumerGroupOffset {

    @JsonIgnore
	private org.apache.kafka.common.TopicPartition key;
	private String consumerId;
	private String clientId;
	private String host;

	private int partition;
	private String topic;
	private Long offset;
	private Long endOffset;

}
