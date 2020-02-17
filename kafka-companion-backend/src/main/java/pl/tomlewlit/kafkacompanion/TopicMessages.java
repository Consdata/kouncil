package pl.tomlewlit.kafkacompanion;

import lombok.Builder;
import lombok.Data;
import lombok.Singular;
import org.apache.kafka.common.TopicPartition;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class TopicMessages {

	@Singular
	private List<Message> messages;

	//poczatki
	private Map<TopicPartition, Long> partitionOffsets;

	//końce
	private Map<TopicPartition, Long> partitionEndOffsets;
}
