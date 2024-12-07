package com.consdata.kouncil.serde;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.serde.formatter.schema.AvroMessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Objects;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class AvroDeserializationServiceTest {

    private static final byte[] AVRO_SIMPLE_MESSAGE_BYTES = new byte[]{0, 0, 0, 0, 0, 34, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116,
            117, 114, -6, -84, 68, 20, 50, 48, 50, 52, 45, 48, 49, 45, 48, 49};
    private static final String LOREM = "lorem";
    private static final String CLUSTER_ID = "clusterId";
    private static AvroSchema AVRO_SCHEMA;
    private static String SIMPLE_MESSAGE_JSON;
    @MockBean
    private SchemaAwareClusterService schemaAwareClusterService;

    @MockBean
    private SchemaRegistryFacade schemaRegistryFacade;

    private final SchemaRegistryClient schemaRegistryClient = new MockSchemaRegistryClient();

    @Autowired
    private DeserializationService deserializationService;

    @BeforeAll
    public static void beforeAll() throws IOException, URISyntaxException {
        var avroSchemaPath = Paths.get(AvroDeserializationServiceTest.class.getClassLoader()
                .getResource("SimpleMessage.avro").toURI());
        AVRO_SCHEMA = new AvroSchema(Files.readString(avroSchemaPath));

        SIMPLE_MESSAGE_JSON = Files.readString(
                Paths.get(Objects.requireNonNull(
                        AvroDeserializationServiceTest.class.getClassLoader().getResource("SimpleMessageAvro.json")).toURI()
                )).trim();
    }

    @SneakyThrows
    @Test
    void should_deserialize_value_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                new Bytes(AVRO_SIMPLE_MESSAGE_BYTES)
        );
        schemaRegistryClient.register("sometopic-value", AVRO_SCHEMA, 0, 0);

        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.AVRO);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.AVRO);
    }

    @SneakyThrows
    @Test
    void should_deserialize_key_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(AVRO_SIMPLE_MESSAGE_BYTES),
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8))
        );
        schemaRegistryClient.register("sometopic-value", AVRO_SCHEMA, 0, 0);

        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.AVRO);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.AVRO);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
    }

    @SneakyThrows
    @Test
    void should_deserialize_with_schema_key_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                null,
                new Bytes(AVRO_SIMPLE_MESSAGE_BYTES)
        );
        schemaRegistryClient.register("sometopic-value", AVRO_SCHEMA, 0, 0);

        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.AVRO);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isNull();
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.AVRO);
    }

    @SneakyThrows
    @Test
    void should_deserialize_with_schema_value_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(AVRO_SIMPLE_MESSAGE_BYTES),
                null
        );
        schemaRegistryClient.register("sometopic-value", AVRO_SCHEMA, 0, 0);

        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.AVRO);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.AVRO);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isNull();
    }

    private ConsumerRecord<Bytes, Bytes> prepareConsumerRecord(Bytes key, Bytes value) {
        return new ConsumerRecord<>("sometopic",
                0,
                0,
                key,
                value);
    }
}
