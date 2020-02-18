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

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
public class TopicController {

	@Autowired
	public TopicController(KafkaTemplate<String, String> kafkaTemplate,
						   KafkaCompanionConfiguration kafkaCompanionConfiguration) {
		this.kafkaTemplate = kafkaTemplate;
		this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
	}

	@GetMapping("/api/topic/messages/{topicName}/{partition}/{offset}")
	public TopicMessages getTopicMessages(@PathVariable("topicName") String topicName,
										  @PathVariable("partition") int partition,
										  @PathVariable("offset") String offset) {
		log.debug("TCM01 topicName={}, partition={}, offset={}", topicName, partition, offset);
		Properties props = createCommonProperties();
		props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
		try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
			List<PartitionInfo> partitionInfos = consumer.partitionsFor(topicName);
			log.debug("TCM02 partitionInfos.size={}, partitionInfos={}", partitionInfos.size(), partitionInfos);
			List<TopicPartition> topicPartitions = new ArrayList<>();
			for (int i = 0; i < partitionInfos.size(); i++) {
				topicPartitions.add(new TopicPartition(topicName, i));
			}
			consumer.assign(topicPartitions);
			Map<Integer, Long> beginningOffsets = consumer.beginningOffsets(topicPartitions).entrySet().stream().collect(Collectors.toMap(k -> k.getKey().partition(), e -> e.getValue()));
			Long beginningOffsetForPartition = beginningOffsets.get(partition);
			log.debug("TCM03 beginningOffsets={}, beginningOffsetForPartition={}", beginningOffsets, beginningOffsetForPartition);
			Map<Integer, Long> endOffsets = consumer.endOffsets(topicPartitions).entrySet().stream().collect(Collectors.toMap(k -> k.getKey().partition(), e -> e.getValue()));
			log.debug("TCM04 endOffsets={}", endOffsets);

			long position;

			if ("latest".equals(offset)) {
				position = consumer.position(topicPartitions.get(partition));
			} else {
				position = Long.parseLong(offset);
			}
			log.debug("TCM05 position={}", position);
			long seekTo = position - 25;
			if (seekTo > beginningOffsetForPartition) {
				log.debug("TCM11 seekTo={}", seekTo);
				consumer.seek(topicPartitions.get(partition), seekTo);
			} else {
				log.debug("TCM12 seekToBeginning");
				consumer.seekToBeginning(Collections.singletonList(topicPartitions.get(partition)));
			}

			List<Message> messages = new ArrayList<>();
			int i = 0;
			while (i < 5 && messages.size() < 25) {
				ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
				log.debug("TCM20 poll completed records.size={}", records.count());
				if (!records.isEmpty()) {
					mapRecords(messages, records);
				}
				i++;
			}
			messages.sort(Comparator.comparing(Message::getTimestamp));
			TopicMessages topicMessages = TopicMessages.builder().messages(messages).partitionOffsets(beginningOffsets).partitionEndOffsets(endOffsets).build();
			log.debug("TCM99 topicName={}, partition={}, offset={} topicMessages.size={}", topicName, partition, offset, topicMessages.getMessages().size());
			return topicMessages;

		}
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

	private void mapRecords(List<Message> messages,
							ConsumerRecords<String, String> records) {
		for (ConsumerRecord<String, String> record : records) {
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
