package pl.tomlewlit.kafkacompanion;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import javax.annotation.PostConstruct;

import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BrokersController {

	public BrokersController(KafkaCompanionConfiguration kafkaCompanionConfiguration) {
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

	@GetMapping("/api/brokers")
	public Brokers getBrokers() {
		try {
			DescribeClusterResult describeClusterResult = adminClient.describeCluster();
			Collection<Node> nodes = describeClusterResult.nodes().get();
			List<Broker> brokers = new ArrayList<>();
			nodes.forEach(node -> {
				brokers.add(Broker.builder().host(node.host()).port(node.port()).id(node.idString()).rack(node.rack()).build());
			});
			Collections.sort(brokers);
			return Brokers.builder().brokers(brokers).build();
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private AdminClient adminClient;
	private KafkaCompanionConfiguration kafkaCompanionConfiguration;
}
