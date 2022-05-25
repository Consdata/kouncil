package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.serde.formatter.schema.JsonSchemaMessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@SpringBootTest
public class JsonSchemaDeserializationServiceTest {
    private static final byte[] JSON_SCHEMA_SIMPLE_MESSAGE_BYTES = new byte[]{0, 0, 0, 0, 0, 123, 34, 99, 111, 110, 116, 101, 110, 116, 34, 58, 34, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116, 117, 114, 34, 44, 34, 115, 111, 109, 101, 78, 117, 109, 98, 101, 114, 34, 58, 53, 53, 57, 57, 51, 51, 44, 34, 114, 101, 99, 101, 105, 118, 101, 100, 68, 97, 116, 101, 34, 58, 34, 118, 101, 110, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 97, 116, 101, 34, 125};
    private static final String LOREM = "lorem";
    private static final String CLUSTER_ID = "clusterId";
    private static JsonSchema JSON_SCHEMA;
    private static String SIMPLE_MESSAGE_JSON;
    @MockBean
    private SchemaAwareClusterService schemaAwareClusterService;

    @MockBean
    private SchemaRegistryFacade schemaRegistryFacade;

    @MockBean
    private SchemaRegistryClient schemaRegistryClient;

    @Autowired
    private DeserializationService deserializationService;

    @BeforeAll
    public static void beforeAll() throws IOException, URISyntaxException {
        var jsonSchemaPath = Paths.get(JsonSchemaDeserializationServiceTest.class.getClassLoader()
                .getResource("SimpleMessage.schema.json").toURI());
        JSON_SCHEMA = new JsonSchema(Files.readString(jsonSchemaPath));

        SIMPLE_MESSAGE_JSON = Files.readString(
                Paths.get(Objects.requireNonNull(
                        JsonSchemaDeserializationServiceTest.class.getClassLoader().getResource("SimpleMessage.json")).toURI()
                )).trim();
    }

    @SneakyThrows
    @Test
    public void should_deserialize_value_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                new Bytes(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES)
        );
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryClient.getSchemaBySubjectAndId(any(), anyInt())).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(eq(CLUSTER_ID))).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.JSON);
    }

    @SneakyThrows
    @Test
    public void should_deserialize_key_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES),
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8))
        );
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryClient.getSchemaBySubjectAndId(any(), anyInt())).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(eq(CLUSTER_ID))).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.JSON);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
    }

    @SneakyThrows
    @Test
    public void should_deserialize_with_schema_key_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                null,
                new Bytes(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES)
        );
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryClient.getSchemaBySubjectAndId(any(), anyInt())).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(eq(CLUSTER_ID))).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isNull();
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.JSON);
    }

    @SneakyThrows
    @Test
    public void should_deserialize_with_schema_value_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES),
                null
        );
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        when(schemaRegistryClient.getSchemaBySubjectAndId(any(), anyInt())).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(eq(CLUSTER_ID))).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize(CLUSTER_ID, message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(SIMPLE_MESSAGE_JSON);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.JSON);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isNull();
    }

    private ConsumerRecord<Bytes, Bytes> prepareConsumerRecord(Bytes key, Bytes value) {
        return new ConsumerRecord<>("sometopic",
                0,
                0,
                0,
                TimestampType.NO_TIMESTAMP_TYPE,
                0L,
                0,
                0,
                key,
                value);
    }
}
