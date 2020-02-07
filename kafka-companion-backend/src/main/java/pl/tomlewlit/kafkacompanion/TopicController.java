package pl.tomlewlit.kafkacompanion;

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
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
public class TopicController {

	@Autowired
	public TopicController(KafkaTemplate<String, String> kafkaTemplate,
						   KafkaCompanionConfiguration kafkaCompanionConfiguration) {
		this.kafkaTemplate = kafkaTemplate;
		this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
	}

	@GetMapping("/api/topic/messages/{topicName}/{partitions}/{timeout}")
	public TopicMessages getTopicMessages(@PathVariable("topicName") String topicName,
										  @PathVariable("partitions") int partitions,
										  @PathVariable("timeout") int timeout) {
		Properties props = createCommonProperties();
		props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
		try (KafkaConsumer<String, String> consumer = createConsumer(topicName, partitions, props)) {
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
					consumer.seek(topicPartition, position - maxPartitionMessages);
				} else {
					position = 0;
					consumer.seekToBeginning(Collections.singletonList(topicPartition));
				}
			});

			List<Message> messages = new ArrayList<>();

			long time = 0;
			while (time < timeout) {
				ConsumerRecords<String, String> records = consumer.poll(1000);
				time += 1000;
				mapRecords(messages, records, partitionOffsets);
				if (records.isEmpty()) {
					break;
				}
			}


			messages.sort(Comparator.comparing(Message::getTimestamp));
			return TopicMessages.builder().messages(messages).partitionOffsets(partitionOffsets).build();
		}
	}

	@GetMapping("/api/topic/delta/{topicName}/{partitions}/{timeout}")
	public TopicMessages getDelta(@PathVariable("topicName") String topicName,
								  @PathVariable("partitions") int partitions,
								  @PathVariable("timeout") int timeout) {
		Properties props = createCommonProperties();
		KafkaConsumer<String, String> consumer = createConsumer(topicName, partitions, props);

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

	private KafkaConsumer<String, String> createConsumer(String topicName,
														 int partitions,
														 Properties props) {
		KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
		List<TopicPartition> topicPartitions = new ArrayList<>();
		for (int i = 0; i < partitions; i++) {
			topicPartitions.add(new TopicPartition(topicName, i));
		}
		consumer.assign(topicPartitions);
		return consumer;
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

	private String replaceTokens(String data, int i) {
		return data
				.replace("{{count}}", String.valueOf(i))
				.replace("{{timestamp}}", String.valueOf(System.currentTimeMillis()))
				.replace("{{uuid}}", UUID.randomUUID().toString());
	}

	private Properties createCommonProperties() {
		Properties props = new Properties();
		props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaCompanionConfiguration.getBootstrapServers());
		props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
		props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
		props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
		return props;
	}

	private KafkaTemplate<String, String> kafkaTemplate;
	private KafkaCompanionConfiguration kafkaCompanionConfiguration;
}
