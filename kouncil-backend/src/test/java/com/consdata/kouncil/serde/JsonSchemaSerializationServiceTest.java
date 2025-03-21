package com.consdata.kouncil.serde;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.formatter.schema.JsonSchemaMessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationService;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.SneakyThrows;
import org.apache.kafka.clients.producer.ProducerRecord;
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
class JsonSchemaSerializationServiceTest {

    private static final byte[] JSON_SCHEMA_SIMPLE_MESSAGE_BYTES = new byte[]{0, 0, 0, 0, 0, 123, 34, 115, 111, 109, 101, 78, 117, 109, 98, 101, 114, 34, 58,
            53, 53, 57, 57, 51, 51, 44, 34, 114, 101, 99, 101, 105, 118, 101, 100, 68, 97, 116, 101, 34, 58, 34, 50, 48, 50, 52, 45, 48, 49, 45, 48, 49, 34,
            44, 34, 99, 111, 110, 116, 101, 110, 116, 34, 58, 34, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116, 117, 114, 34, 125};
    private static final String LOREM = "lorem";
    private static final SchemaMetadata SCHEMA_METADATA_MOCK = new SchemaMetadata(10, 100, "unused");
    private static final String CLUSTER_ID = "clusterId";
    private static JsonSchema JSON_SCHEMA;
    private static String SIMPLE_MESSAGE_JSON;

    @MockBean
    private SchemaAwareClusterService schemaAwareClusterService;

    @MockBean
    private SchemaRegistryFacade schemaRegistryFacade;

    private final SchemaRegistryClient schemaRegistryClient = new MockSchemaRegistryClient(
            List.of(new JsonSchemaProvider()));

    @Autowired
    private SerializationService serializationService;

    @BeforeAll
    public static void beforeAll() throws IOException, URISyntaxException {
        var jsonSchemaPath = Paths.get(JsonSchemaSerializationServiceTest.class.getClassLoader()
                .getResource("SimpleMessage.schema.json").toURI());
        JSON_SCHEMA = new JsonSchema(Files.readString(jsonSchemaPath));

        SIMPLE_MESSAGE_JSON = Files.readString(
                Paths.get(Objects.requireNonNull(
                        JsonSchemaSerializationServiceTest.class.getClassLoader().getResource("SimpleMessage.json")).toURI()
                )).trim();
    }

    @Test
    @SneakyThrows
    void should_serialize_value_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        when(schemaRegistryFacade.getSchemaByTopicAndId(any(KouncilSchemaMetadata.class))).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false))).thenReturn(Optional.of(SCHEMA_METADATA_MOCK));
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true))).thenReturn(Optional.empty());
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);

        schemaRegistryClient.register("topicName-value", JSON_SCHEMA, 0, 0);

        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serializationService.serialize(CLUSTER_ID, "topicName", LOREM, SIMPLE_MESSAGE_JSON);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES));
    }

    @Test
    @SneakyThrows
    void should_serialize_key_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        when(schemaRegistryFacade.getSchemaByTopicAndId(any(KouncilSchemaMetadata.class))).thenReturn(JSON_SCHEMA);
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true))).thenReturn(Optional.of(SCHEMA_METADATA_MOCK));
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false))).thenReturn(Optional.empty());
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.JSON);
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);

        schemaRegistryClient.register("topicName-key", JSON_SCHEMA, 0, 0);

        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.JSON, new JsonSchemaMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());

        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serializationService.serialize(CLUSTER_ID, "topicName", SIMPLE_MESSAGE_JSON, LOREM);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(JSON_SCHEMA_SIMPLE_MESSAGE_BYTES));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
    }
}
