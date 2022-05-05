package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class StringMessageSerdeTest {

    private final com.consdata.kouncil.serde.StringMessageSerde stringMessageSerde = new com.consdata.kouncil.serde.StringMessageSerde(
            new StringMessageFormatter()
    );

    @Test
    void should_deserialize_string() {
        // given
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes("lorem".getBytes(StandardCharsets.UTF_8)),
                new Bytes("ipsum".getBytes(StandardCharsets.UTF_8))
        );
        // when
        DeserializedValue deserializedValue = stringMessageSerde.deserialize(message);

        // then
        assertThat(deserializedValue.getDeserializedKey()).isEqualTo("lorem");
        assertThat(deserializedValue.getDeserializedValue()).isEqualTo("ipsum");
        assertThat(deserializedValue.getKeyFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedValue.getValueFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedValue.getKeySchemaId()).isNull();
        assertThat(deserializedValue.getValueSchemaId()).isNull();
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
