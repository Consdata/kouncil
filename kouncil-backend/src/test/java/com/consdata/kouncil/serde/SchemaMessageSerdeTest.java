package com.consdata.kouncil.serde;

import com.consdata.kouncil.schemaregistry.SchemaRegistryService;
import com.consdata.kouncil.serde.formatter.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.record.TimestampType;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.EnumMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SchemaMessageSerdeTest {
    private static final byte[] PROTOBUF_SIMPLE_MESSAGE_BYTES = new byte[] {0, 0, 0, 0, 1, 0, 10, 17, 76, 111, 114, 101, 109, 32, 99, 111, 110, 115, 101, 99, 116, 101, 116, 117, 114, 16, -67, -106, 34, 26, 16, 118, 101, 110, 105, 97, 109, 32, 118, 111, 108, 117, 112, 116, 97, 116, 101};
    private final SchemaMessageSerde schemaMessageSerde = new SchemaMessageSerde();

    @Mock
    private SchemaRegistryService schemaRegistryService;

    private ClusterAwareSchema clusterAwareSchema;

    @BeforeEach
    public void before() {
        when(schemaRegistryService.getSchemaRegistryClient()).thenReturn(new MockSchemaRegistry());

        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryService.getSchemaRegistryClient()));
        formatters.put(MessageFormat.STRING, new StringMessageFormatter());

        clusterAwareSchema = ClusterAwareSchema.builder()
                .schemaRegistryService(schemaRegistryService)
                .formatters(formatters)
                .build();
    }

    @Test
    public void should_deserialize_protobuf_message() throws URISyntaxException, IOException {
        // given
        when(schemaRegistryService.getSchemaFormat(anyString(), eq(1), anyBoolean())).thenReturn(MessageFormat.PROTOBUF);

        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes("lorem".getBytes(StandardCharsets.UTF_8)),
                new Bytes(PROTOBUF_SIMPLE_MESSAGE_BYTES)
        );

        // when
        DeserializedValue deserializedValue = schemaMessageSerde.deserialize(clusterAwareSchema, message);

        // then
        assertThat(deserializedValue.getValueFormat()).isEqualTo(MessageFormat.PROTOBUF);
        assertThat(deserializedValue.getKeyFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedValue.getDeserializedKey()).isEqualTo("lorem");

        var simpleMessageJsonContent = Files.readString(Paths.get(SchemaMessageSerdeTest.class.getClassLoader()
                .getResource("SimpleMessage.json").toURI())).trim();
        assertThat(deserializedValue.getDeserializedValue()).isEqualTo(simpleMessageJsonContent);
    }

    @Test
    public void should_deserialize_string_message() {
        // given
        ConsumerRecord<Bytes, Bytes> message = prepareConsumerRecord(
                new Bytes("lorem".getBytes(StandardCharsets.UTF_8)),
                new Bytes("ipsum".getBytes(StandardCharsets.UTF_8))
        );

        // when
        DeserializedValue deserializedValue = schemaMessageSerde.deserialize(clusterAwareSchema, message);

        // then
        assertThat(deserializedValue.getKeyFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedValue.getValueFormat()).isEqualTo(MessageFormat.STRING);
        assertThat(deserializedValue.getDeserializedValue()).isEqualTo("ipsum");
        assertThat(deserializedValue.getDeserializedKey()).isEqualTo("lorem");
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
