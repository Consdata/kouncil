package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class StringMessageSerdeTest {

    private final StringMessageSerde stringMessageSerde = new StringMessageSerde(new StringMessageFormatter());

    @Test
    void should_deserialize_string() {
        // given
        Bytes payload = new Bytes("lorem".getBytes(StandardCharsets.UTF_8));
        // when
        String deserializedPayload = stringMessageSerde.deserialize(payload);

        // then
        assertThat(deserializedPayload).isEqualTo("lorem");
    }
}
