package com.consdata.kouncil.serde;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;

class StringMessageSerdeTest {

    private final StringMessageSerde stringMessageSerde = new StringMessageSerde();

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
