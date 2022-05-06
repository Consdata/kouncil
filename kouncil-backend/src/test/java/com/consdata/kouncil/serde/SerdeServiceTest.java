package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.ProtobufMessageFormatter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SerdeServiceTest {
    private static final byte[] PROTOBUF_SIMPLE_MESSAGE_BYTES = new byte[] {0, 0, 0, 0, 1, 0, 10, 17, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116, 117, 114, 16, -67, -106, 34, 26, 16, 118, 101, 110, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 97, 116, 101};
    private static final String LOREM = "lorem";
    private static final String IPSUM = "ipsum";
    @Mock
    private SchemaAwareClusterService schemaAwareClusterService;

    @Mock
    private SchemaRegistryFacade schemaRegistryFacade;

    @Mock
    private SchemaRegistryClient schemaRegistryClient;

    @InjectMocks
    private SerdeService serdeService;

    @Test
    public void should_deserialize_without_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                new Bytes(IPSUM.getBytes(StandardCharsets.UTF_8))
        );

        // when
        DeserializedMessage deserializedMessage = serdeService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getValueFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(IPSUM);
        assertThat(deserializedMessage.getValueData().getValueFormat()).isEqualTo(MessageFormat.STRING);
    }

    @Test
    public void should_deserialize_without_schema_key_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                null,
                new Bytes(IPSUM.getBytes(StandardCharsets.UTF_8))
        );

        // when
        DeserializedMessage deserializedMessage = serdeService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getKeyData().getValueFormat()).isNull();
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(IPSUM);
        assertThat(deserializedMessage.getValueData().getValueFormat()).isEqualTo(MessageFormat.STRING);
    }

    @Test
    public void should_deserialize_without_schema_value_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                null
        );

        // when
        DeserializedMessage deserializedMessage = serdeService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getValueFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getValueData().getValueFormat()).isNull();
    }

    @Test
    public void should_serialize_without_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);

        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serdeService.serialize("clusterId", "topicName", LOREM, IPSUM);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(IPSUM.getBytes()));
    }

    @Test
    @SneakyThrows
    public void should_serialize_with_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(true);
        setMocksForProtobuf(false, true);

        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));

        when(schemaAwareClusterService.getClusterSchema(eq("clusterId"))).thenReturn(
                SchemaAwareCluster.builder()
                        .schemaRegistryFacade(schemaRegistryFacade)
                        .formatters(formatters)
                        .build()
        );

        var simpleMessageJsonContent = Files.readString(
                Paths.get(Objects.requireNonNull(
                        SerdeServiceTest.class.getClassLoader().getResource("SimpleMessage.json")).toURI()
                )).trim();

        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serdeService.serialize("clusterId", "topicName", LOREM, simpleMessageJsonContent);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(PROTOBUF_SIMPLE_MESSAGE_BYTES));
    }

    private void setMocksForProtobuf(boolean mockSchemaForKey, boolean mockSchemaForValue) throws URISyntaxException, IOException, RestClientException {
        var protobufSchemaPath = Paths.get(SerdeServiceTest.class.getClassLoader()
                .getResource("SimpleMessage.proto").toURI());
        ProtobufSchema simpleMessageSchema = new ProtobufSchema(Files.readString(protobufSchemaPath));

        when(schemaRegistryFacade.getSchemaByTopicAndId(any(KouncilSchemaMetadata.class))).thenReturn(simpleMessageSchema);
        when(schemaRegistryFacade.getSchemaRegistryClient()).thenReturn(schemaRegistryClient);

        if (mockSchemaForKey) {
            when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true)))
                    .thenReturn(Optional.of(new SchemaMetadata(10, 100, "unused")));
        } else {
            when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(true)))
                    .thenReturn(Optional.empty());
        }

        if (mockSchemaForValue) {
            when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false)))
                    .thenReturn(Optional.of(new SchemaMetadata(10, 100, "unused")));
        } else {
            when(schemaRegistryFacade.getLatestSchemaMetadata(anyString(), eq(false)))
                    .thenReturn(Optional.empty());
        }

        when(schemaRegistryFacade.getSchemaFormat(any(KouncilSchemaMetadata.class))).thenReturn(MessageFormat.PROTOBUF);
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
