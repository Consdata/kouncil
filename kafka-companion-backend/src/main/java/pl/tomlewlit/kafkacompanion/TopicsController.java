package pl.tomlewlit.kafkacompanion;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeTopicsResult;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TopicsController {

	public TopicsController(KafkaCompanionConfiguration kafkaCompanionConfiguration) {
		this.kafkaCompanionConfiguration = kafkaCompanionConfiguration;
	}

	@PostConstruct
	private void postConstruct() {
		Properties props = new Properties();
		props.setProperty("bootstrap.servers", kafkaCompanionConfiguration.getBootstrapServers());
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

	@GetMapping("/api/topics")
	public Topics getTopics() {
		try {
			ListTopicsResult listTopicsResult = adminClient.listTopics();
			List<String> children = new ArrayList<>(listTopicsResult.names().get());
			Collections.sort(children);
			// XXX: optimization possiblity: describe all topics in one call
			List<TopicMetadata> topics = children.stream().map(this::getTopicMetadata).collect(Collectors.toList());
			return Topics.builder().topics(topics).build();
		} catch (Exception e) {
			throw new RuntimeException();
		}
	}

	private TopicMetadata getTopicMetadata(String name) {
		try {
			DescribeTopicsResult describeTopicsResult = adminClient.describeTopics(Collections.singletonList(name));
			Map<String, TopicDescription> topics = describeTopicsResult.all().get();
			TopicDescription topicDescription = topics.get(name);
			int partitions = -1;
			if (topicDescription != null) {
				partitions = topicDescription.partitions().size();
			}
			return TopicMetadata.builder().name(name).partitions(partitions).build();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private AdminClient adminClient;
	private KafkaCompanionConfiguration kafkaCompanionConfiguration;

}
