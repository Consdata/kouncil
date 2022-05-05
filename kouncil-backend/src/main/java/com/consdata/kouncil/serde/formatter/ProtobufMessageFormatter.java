package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import com.google.protobuf.Message;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
import org.apache.kafka.common.utils.Bytes;

import java.io.IOException;

public class ProtobufMessageFormatter implements MessageFormatter {
    private final KafkaProtobufDeserializer<Message> protobufDeserializer;
    private final KafkaProtobufSerializer<Message> protobufSerializer;

    public ProtobufMessageFormatter(SchemaRegistryClient client) {
        this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
        this.protobufSerializer = new KafkaProtobufSerializer<>(client);
    }

    @Override
    public String deserialize(String topic, byte[] value) {
        final Message message = protobufDeserializer.deserialize(topic, value);
        try {
            return new String(ProtobufSchemaUtils.toJson(message));
        } catch (IOException e) {
            throw new RuntimeException("Failed to deserialize record for topic " + topic, e);
        }
    }

    @Override
    public Bytes serialize(String topic, String value, ParsedSchema parsedSchema) {
        ProtobufSchema protobufSchema = (ProtobufSchema) parsedSchema;
        try {
            byte[] serialized = protobufSerializer.serialize(topic,
                    protobufSchema.newMessageBuilder().mergeFrom(value.getBytes()).build());
            return Bytes.wrap(serialized);
        } catch (Throwable e) {
            throw new RuntimeException("Failed to serialize record for topic " + topic, e);
        }
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.PROTOBUF;
    }
}
