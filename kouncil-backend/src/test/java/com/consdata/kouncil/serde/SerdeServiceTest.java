package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SerdeServiceTest {
    private static final String LOREM = "lorem";
    private static final String IPSUM = "ipsum";
    @Mock
    private SchemaAwareClusterService schemaAwareClusterService;

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
