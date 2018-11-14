package pl.tomlewlit.kafkacompanion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopicPartition {

	private int partition;
	private String topic;

}
