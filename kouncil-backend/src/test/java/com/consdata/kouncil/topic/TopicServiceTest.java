package com.consdata.kouncil.topic;

import static org.assertj.core.api.Assertions.assertThat;

import com.consdata.kouncil.KafkaConnectionService;
import java.util.stream.IntStream;
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
