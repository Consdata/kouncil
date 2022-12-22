package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.deserialization.DeserializationService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class NoSchemaDeserializationServiceTest {
    private static final String LOREM = "lorem";
    private static final String IPSUM = "ipsum";
    @MockBean
    private SchemaAwareClusterService schemaAwareClusterService;
    @Autowired
    private DeserializationService deserializationService;

    @Test
    void should_deserialize_without_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                new Bytes(IPSUM.getBytes(StandardCharsets.UTF_8))
        );

        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(IPSUM);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
    }

    @Test
    void should_deserialize_without_schema_key_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                null,
                new Bytes(IPSUM.getBytes(StandardCharsets.UTF_8))
        );

        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isNull();
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isNull();
        assertThat(deserializedMessage.getValueData().getDeserialized()).isEqualTo(IPSUM);
        assertThat(deserializedMessage.getValueData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
    }

    @Test
    void should_deserialize_without_schema_value_null() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes(LOREM.getBytes(StandardCharsets.UTF_8)),
                null
        );

        // when
        DeserializedMessage deserializedMessage = deserializationService.deserialize("clusterId", message);

        // then
        assertThat(deserializedMessage.getKeyData().getDeserialized()).isEqualTo(LOREM);
        assertThat(deserializedMessage.getKeyData().getMessageFormat()).isEqualTo(MessageFormat.STRING);
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
