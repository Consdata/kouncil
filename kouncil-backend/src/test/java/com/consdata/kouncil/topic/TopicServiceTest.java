package com.consdata.kouncil.topic;

import static org.assertj.core.api.Assertions.assertThat;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.clusters.ClusterRepository;
import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSecurityConfig;
import java.util.Set;
import java.util.stream.IntStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(
        partitions = 4,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers",
        brokerProperties = {"listeners=PLAINTEXT://localhost:59092", "port=59092"},
        ports = 59092
)
class TopicServiceTest {

    private static final String BOOSTRAP_SERVER = "localhost_59092";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    @Autowired
    private TopicService topicService;
    @Autowired
    protected KafkaConnectionService kafkaConnectionService;
    @Autowired
    private ClusterRepository repository;
    @Autowired
    private KouncilConfiguration kouncilConfiguration;

    @BeforeEach
    public void setUp() {
        repository.deleteAll();
        Cluster cluster = new Cluster();
        cluster.setName(BOOSTRAP_SERVER);

        Broker broker = new Broker();
        broker.setBootstrapServer("localhost:59092");
        cluster.setBrokers(Set.of(broker));

        ClusterSecurityConfig clusterSecurityConfig = new ClusterSecurityConfig();
        clusterSecurityConfig.setAuthenticationMethod(ClusterAuthenticationMethod.NONE);
        cluster.setClusterSecurityConfig(clusterSecurityConfig);

        repository.save(cluster);
        kouncilConfiguration.initializeClusters();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_fetch_all_generated_messages() {
        IntStream.range(0, 100).forEach(index -> kafkaTemplate.send("embedded-test-topic", String.format("Msg no %s", index)));
        kafkaConnectionService.getAdminClient(BOOSTRAP_SERVER);

        TopicMessagesDto topicMessages = topicService.getTopicMessages("embedded-test-topic", "all", "1", "100",
                null, null, null, BOOSTRAP_SERVER);
        assertThat(topicMessages.getMessages()).hasSize(100);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void should_fetch_all_generated_messages_small_amount() {
        IntStream.range(0, 2).forEach(index -> kafkaTemplate.send("embedded-test-topic-2", String.format("Msg no %s", index)));
        kafkaConnectionService.getAdminClient(BOOSTRAP_SERVER);

        TopicMessagesDto topicMessages = topicService.getTopicMessages("embedded-test-topic-2", "all", "1", "10",
                null, null, null, BOOSTRAP_SERVER);
        assertThat(topicMessages.getMessages()).hasSize(2);
    }
}
