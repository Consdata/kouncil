package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.ProtobufMessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationService;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import java.util.Arrays;
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

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class ProtobufSerializationServiceTest {
    private static final byte[] PROTOBUF_SIMPLE_MESSAGE_BYTES = new byte[]{0, 0, 0, 0, 0, 0, 10, 17, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116, 117, 114, 16, -67, -106, 34, 26, 10, 50, 48, 50, 52, 45, 48, 49, 45, 48, 49};
    private static final String LOREM = "lorem";
    private static final SchemaMetadata SCHEMA_METADATA_MOCK = new SchemaMetadata(10, 100, "unused");
    private static final String CLUSTER_ID = "clusterId";
    private static ProtobufSchema PROTOBUF_SCHEMA;
    private static String SIMPLE_MESSAGE_JSON;
    @MockBean
    private SchemaAwareClusterService schemaAwareClusterService;

    @MockBean
    private SchemaRegistryFacade schemaRegistryFacade;

    @MockBean
    private SchemaRegistryClient schemaRegistryClient;

    @Autowired
    private SerializationService serializationService;

    @BeforeAll
    public static void beforeAll() throws IOException, URISyntaxException {
        var protobufSchemaPath = Paths.get(ProtobufSerializationServiceTest.class.getClassLoader()
                .getResource("SimpleMessage.proto").toURI());
        PROTOBUF_SCHEMA = new ProtobufSchema(Files.readString(protobufSchemaPath));

        SIMPLE_MESSAGE_JSON = Files.readString(
                Paths.get(Objects.requireNonNull(
                        ProtobufSerializationServiceTest.class.getClassLoader().getResource("SimpleMessage.json")).toURI()
                )).trim();
    }

    @Test
    @SneakyThrows
    void should_serialize_value_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        when(schemaRegistryFacade.getSchemaByTopicAndId(any(KouncilSchemaMetadata.class))).thenReturn(PROTOBUF_SCHEMA);
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false))).thenReturn(Optional.of(SCHEMA_METADATA_MOCK));
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true))).thenReturn(Optional.empty());
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.PROTOBUF);
        when(schemaRegistryClient.getLatestSchemaMetadata(anyString())).thenReturn(SCHEMA_METADATA_MOCK);
        when(schemaRegistryClient.parseSchema(anyString(), anyString(), anyList())).thenReturn(Optional.of(PROTOBUF_SCHEMA));
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());
        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serializationService.serialize(CLUSTER_ID, "topicName", LOREM, SIMPLE_MESSAGE_JSON);

        // then
        System.out.println(Arrays.toString(serializedMessage.value().get()));
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(PROTOBUF_SIMPLE_MESSAGE_BYTES));
    }

    @Test
    @SneakyThrows
    void should_serialize_key_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        when(schemaRegistryFacade.getSchemaByTopicAndId(any(KouncilSchemaMetadata.class))).thenReturn(PROTOBUF_SCHEMA);
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true))).thenReturn(Optional.of(SCHEMA_METADATA_MOCK));
        when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false))).thenReturn(Optional.empty());
        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.PROTOBUF);
        when(schemaRegistryClient.getLatestSchemaMetadata(anyString())).thenReturn(SCHEMA_METADATA_MOCK);
        when(schemaRegistryClient.parseSchema(anyString(), anyString(), anyList())).thenReturn(Optional.of(PROTOBUF_SCHEMA));
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);

        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        when(schemaAwareClusterService.getClusterSchema(CLUSTER_ID)).thenReturn(SchemaAwareCluster.builder()
                .schemaRegistryFacade(schemaRegistryFacade)
                .formatters(formatters)
                .build());

        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serializationService.serialize(CLUSTER_ID, "topicName", SIMPLE_MESSAGE_JSON, LOREM);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(PROTOBUF_SIMPLE_MESSAGE_BYTES));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
    }
}
