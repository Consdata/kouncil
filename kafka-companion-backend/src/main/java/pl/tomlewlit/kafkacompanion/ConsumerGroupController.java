package pl.tomlewlit.kafkacompanion;

import java.util.ArrayList;
import java.util.Properties;
import javax.annotation.PostConstruct;

import kafka.admin.AdminClient;
import kafka.coordinator.group.GroupOverview;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import scala.Option;
import scala.collection.immutable.List;
import scala.collection.immutable.Map;

@RestController
public class ConsumerGroupController {

	public ConsumerGroupController(KafkaCompanionConfiguration kafkaCompanionConfiguration) {
		this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
	}

	@PostConstruct
	private void postConstruct() {
		Properties props = new Properties();
		props.setProperty(CommonClientConfigs.BOOTSTRAP_SERVERS_CONFIG,
				kafkaCompanionConfiguration.getBootstrapServers());
		props.setProperty("client.id", "kafkaCompanion");
		props.setProperty("metadata.max.age.ms", "3000");
		props.setProperty("group.id", "kafkaCompanion");
		props.setProperty("enable.auto.commit", "true");
		props.setProperty("auto.commit.interval.ms", "1000");
		props.setProperty("session.timeout.ms", "30000");
		props.setProperty("key.deserializer", StringDeserializer.class.getName());
		props.setProperty("value.deserializer", StringDeserializer.class.getName());
		adminClient = AdminClient.create(props);
	}

	@GetMapping("/api/consumer-groups")
	public ConsumerGroupsResponse getConsumerGroups() {
		ConsumerGroupsResponse consumerGroups = ConsumerGroupsResponse
				.builder()
				.consumerGroups(new ArrayList<>())
				.build();
		List<GroupOverview> groups = adminClient.listAllConsumerGroupsFlattened();
		groups.iterator().foreach(g -> {
			if(g.groupId().startsWith("kafka-companion-")) {
				return null;
			}
			consumerGroups
					.getConsumerGroups()
					.add(ConsumerGroup.builder().groupId(g.groupId()).protocolType(g.protocolType()).build());
			return null;
		});
		return consumerGroups;
	}

	@GetMapping("/api/consumer-group/{groupId}")
	public ConsumerGroupResponse getConsumerGroup(@PathVariable("groupId") String groupId) {
		ConsumerGroupResponse consumerGroup = ConsumerGroupResponse.builder().assignments(new ArrayList<>()).build();
		Map<org.apache.kafka.common.TopicPartition, Object> offsets = adminClient.listGroupOffsets(groupId);
		AdminClient.ConsumerGroupSummary consumerGroupSummary = adminClient.describeConsumerGroup(groupId, 5000);
		java.util.List<org.apache.kafka.common.TopicPartition> allTopicPartitions = new java.util.ArrayList<>();
		consumerGroupSummary.consumers().get().foreach(kafkaConsumer -> {
			kafkaConsumer.assignment().foreach(kafkaTopicPartition -> {
				allTopicPartitions.add(kafkaTopicPartition);
				Option<Object> offsetOptional = offsets.get(kafkaTopicPartition);
				consumerGroup
						.getAssignments()
						.add(Assignment
								.builder()
								.clientId(kafkaConsumer.clientId())
								.consumerId(kafkaConsumer.consumerId())
								.host(kafkaConsumer.host())
								.topic(kafkaTopicPartition.topic())
								.partition(kafkaTopicPartition.partition())
								.offset(offsetOptional.isEmpty() ? null : (Long) offsetOptional.get())
								.build());
				return null;
			});
			return null;
		});

		KafkaConsumer<String, String> kafkaConsumer = createConsumer();
		try {
			java.util.Map<org.apache.kafka.common.TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(
					allTopicPartitions);
			consumerGroup.getAssignments().forEach(assignment -> {
				String topic = assignment.getTopic();
				int partition = assignment.getPartition();
				assignment.setEndOffset(endOffsets.getOrDefault(new org.apache.kafka.common.TopicPartition(
						topic,
						partition), null));
			});
		} finally {
			kafkaConsumer.close();
		}


		return consumerGroup;
	}

	private KafkaConsumer<String, String> createConsumer() {
		Properties props = new Properties();
		props.put("bootstrap.servers", kafkaCompanionConfiguration.getBootstrapServers());
		props.put("group.id", "" + System.currentTimeMillis());
		props.put("key.deserializer", StringDeserializer.class.getName());
		props.put("value.deserializer", StringDeserializer.class.getName());

		KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
		return consumer;
	}

	private KafkaCompanionConfiguration kafkaCompanionConfiguration;
	private AdminClient adminClient;
}
