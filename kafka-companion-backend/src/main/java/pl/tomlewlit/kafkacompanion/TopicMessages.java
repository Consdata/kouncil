package pl.tomlewlit.kafkacompanion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;
import lombok.Singular;

@Data
@Builder
public class TopicMessages {
	@Singular
	private List<Message> messages = new ArrayList<>();

	private Map<Integer, Long> partitionOffsets = new HashMap<>();
}
