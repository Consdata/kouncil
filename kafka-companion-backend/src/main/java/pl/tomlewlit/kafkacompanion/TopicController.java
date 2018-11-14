package pl.tomlewlit.kafkacompanion;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class TopicController {

	@Autowired
	public TopicController(KafkaTemplate<String, String> kafkaTemplate,
						   KafkaCompanionConfiguration kafkaCompanionConfiguration) {
		this.kafkaTemplate = kafkaTemplate;
		this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
	}

	private KafkaConsumer<String, String> createConsumer(@PathVariable("topicName") String topicName,
														 Properties props) {
		KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
		consumer.subscribe(Arrays.asList(topicName));
		return consumer;
	}

	@GetMapping("/api/topic/messages/{topicName}/{groupId}/{timeout}")
	public TopicMessages getTopicMessages(@PathVariable("topicName") String topicName,
										  @PathVariable("groupId") String groupId,
										  @PathVariable("timeout") int timeout) {
		Properties props = createCommonProperties(groupId);
		props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
		KafkaConsumer<String, String> consumer = createConsumer(topicName, props);
		consumer.poll(10); // just to trigger position assignment
		int maxMessages = 100;
		List<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
		int maxPartitionMessages = maxMessages / partitionInfos.size();
		Map<Integer, Long> partitionOffsets = new HashMap<>();
		partitionInfos.forEach(partitionInfo -> {
			TopicPartition topicPartition = new TopicPartition(topicName, partitionInfo.partition());
			long position = consumer.position(topicPartition);
			partitionOffsets.put(topicPartition.partition(), position);
			log.info("topicPartition: {}, position: {}", topicPartition, position);
			if (position > maxPartitionMessages) {
				position -= maxPartitionMessages;
			} else {
				position = 0;
			}
			consumer.seek(topicPartition, position);
		});

		List<Message> messages = new ArrayList<>();
		try {
			long time = 0;
			while (time < timeout) {
				ConsumerRecords<String, String> records = consumer.poll(1000);
				time += 1000;
				mapRecords(messages, records, partitionOffsets);
				if (records.isEmpty()) {
					break;
				}
			}
		} finally {
			consumer.close();
		}

		messages.sort(Comparator.comparing(Message::getTimestamp));
		return TopicMessages.builder().messages(messages).partitionOffsets(partitionOffsets).build();
	}

	@GetMapping("/api/topic/delta/{topicName}/{groupId}/{timeout}")
	public TopicMessages getDelta(@PathVariable("topicName") String topicName,
								  @PathVariable("groupId") String groupId,
								  @PathVariable("timeout") int timeout) {
		Properties props = createCommonProperties(groupId);
		KafkaConsumer<String, String> consumer = createConsumer(topicName, props);

		List<Message> messages = new ArrayList<>();
		Map<Integer, Long> partitionOffsets = new HashMap<>();
		try {
			long time = 0;
			while (time < timeout) {
				ConsumerRecords<String, String> records = consumer.poll(1000);
				mapRecords(messages, records, partitionOffsets);
				time += 1000;
				if (!records.isEmpty()) {
					break;
				}
			}
		} finally {
			consumer.close();
		}
		return TopicMessages.builder().messages(messages).partitionOffsets(partitionOffsets).build();
	}


	private void mapRecords(List<Message> messages,
							ConsumerRecords<String, String> records,
							Map<Integer, Long> partitionOffsets) {
		for (ConsumerRecord<String, String> record : records) {
			if (partitionOffsets.getOrDefault(record.partition(), -1L) < record.offset()) {
				partitionOffsets.put(record.partition(), record.offset());
			}
			messages.add(Message
					.builder()
					.key(record.key())
					.value(record.value())
					.offset(record.offset())
					.partition(record.partition())
					.timestamp(record.timestamp())
					.build());
		}
	}

	private Properties createCommonProperties(@PathVariable("groupId") String groupId) {
		Properties props = new Properties();
		props.put("bootstrap.servers", kafkaCompanionConfiguration.getBootstrapServers());
		props.put("group.id", groupId);
		props.put("key.deserializer", StringDeserializer.class.getName());
		props.put("value.deserializer", StringDeserializer.class.getName());
		return props;
	}

	@PostMapping("/api/topic/send/{topic}/{key}/{count}")
	public void send(@PathVariable("topic") String topic,
					 @PathVariable("key") String key,
					 @PathVariable("count") int count,
					 @RequestBody String data) {
		log.info("sending");
		for (int i = 0; i < count; i++) {
			kafkaTemplate.send(topic, replaceTokens(key, i), replaceTokens(data, i));
		}
		kafkaTemplate.flush();
	}

	private String replaceTokens(String data, int i) {
		return data
				.replace("{{count}}", String.valueOf(i))
				.replace("{{timestamp}}", String.valueOf(System.currentTimeMillis()))
				.replace("{{uuid}}", UUID.randomUUID().toString());
	}

	private KafkaTemplate<String, String> kafkaTemplate;
	private KafkaCompanionConfiguration kafkaCompanionConfiguration;
}
