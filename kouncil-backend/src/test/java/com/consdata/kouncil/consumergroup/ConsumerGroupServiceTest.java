package com.consdata.kouncil.consumergroup;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.consdata.kouncil.KouncilRuntimeException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.stream.IntStream;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(
        partitions = 1,
        brokerProperties = {"listeners=PLAINTEXT://localhost:59092", "port=59092"},
        ports = 59092
)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ConsumerGroupServiceTest {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    @Autowired
    private ConsumerGroupService consumerGroupService;

    private static final String BOOSTRAP_SERVER = "localhost:59092";
    private static final String TEST_GROUP_ID = "test_group";
    private static final String SERVER_ID = "localhost_59092";
    private static final String TOPIC_NAME = "embedded-test-topic";

    @BeforeAll
    void setUp() {
        IntStream.range(0, 100).forEach(index -> kafkaTemplate.send(TOPIC_NAME, String.format("Msg no %s", index)));
    }

    @Test
    void should_reset_offset_to_zero_when_earliest_set() throws ExecutionException, InterruptedException {
        ConsumerGroupResetDto consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.EARLIEST, null, null);
        test(consumerGroupResetDto, 0, true);
    }

    @Test
    void should_reset_offset_to_last_when_latest_set() throws ExecutionException, InterruptedException {
        ConsumerGroupResetDto consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.LATEST, null, null);
        test(consumerGroupResetDto, 100, true);
    }

    @Test
    void should_reset_offset_to_specific_number_when_offset_number_set() throws ExecutionException, InterruptedException {
        ConsumerGroupResetDto consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.OFFSET_NUMBER, 50L, null);
        test(consumerGroupResetDto, 50, true);
    }

    @Test
    void should_reset_offset_to_correct_offset_when_timestamp_set() throws ExecutionException, InterruptedException {
        ConsumerGroupResetDto consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.TIMESTAMP, null, LocalDateTime.now().minusDays(1).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        test(consumerGroupResetDto, 0, true);

        consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.TIMESTAMP, null, LocalDateTime.now().plusDays(1).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
        test(consumerGroupResetDto, 100, true);
    }

    @Test
    void should_throw_exception_when_consumer_is_running() throws ExecutionException, InterruptedException {
        ConsumerGroupResetDto consumerGroupResetDto = new ConsumerGroupResetDto(SERVER_ID, ConsumerGroupResetType.EARLIEST, null, null);
        test(consumerGroupResetDto, 0, false);
    }

    private void test(ConsumerGroupResetDto consumerGroupResetDto, int expectedOffsetNumber, boolean stopConsumer)
            throws ExecutionException, InterruptedException {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOSTRAP_SERVER);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, TEST_GROUP_ID);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            consumer.subscribe(Collections.singleton(TOPIC_NAME));
            consumer.poll(Duration.ofSeconds(1));
            consumer.commitSync();

            ConsumerGroupResponse beforeReset = consumerGroupService.getConsumerGroup(TEST_GROUP_ID, SERVER_ID);
            assertThat(beforeReset.getConsumerGroupOffset().get(0).getOffset()).isEqualTo(100);

            if (stopConsumer) {
                consumer.close();

                consumerGroupService.resetOffset(TEST_GROUP_ID, consumerGroupResetDto);

                ConsumerGroupResponse afterReset = consumerGroupService.getConsumerGroup(TEST_GROUP_ID, SERVER_ID);
                assertThat(afterReset.getConsumerGroupOffset().get(0).getOffset()).isEqualTo(expectedOffsetNumber);
            } else {
                KouncilRuntimeException kouncilRuntimeException = assertThrows(KouncilRuntimeException.class,
                        () -> consumerGroupService.resetOffset(TEST_GROUP_ID, consumerGroupResetDto));
                assertThat(kouncilRuntimeException.getMessage()).isEqualTo(String.format(
                        "Cannot reset offsets: consumer group %s has active consumers. Please stop all consumers in this group before performing an offset reset.",
                        TEST_GROUP_ID));
            }
        }
    }

}
