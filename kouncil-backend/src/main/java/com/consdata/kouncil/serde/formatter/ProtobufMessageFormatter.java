package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaUtils;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufDeserializer;
import io.confluent.kafka.serializers.protobuf.KafkaProtobufSerializer;
import lombok.SneakyThrows;
import org.apache.kafka.common.utils.Bytes;

public class ProtobufMessageFormatter implements MessageFormatter {
    private final KafkaProtobufDeserializer<Message> protobufDeserializer;
    private final KafkaProtobufSerializer<Message> protobufSerializer;

    public ProtobufMessageFormatter(SchemaRegistryClient client) {
        this.protobufDeserializer = new KafkaProtobufDeserializer<>(client);
        this.protobufSerializer = new KafkaProtobufSerializer<>(client);
    }

    @Override
    @SneakyThrows
    public String format(String topic, byte[] value) {
        final Message message = protobufDeserializer.deserialize(topic, value);
        byte[] jsonBytes = ProtobufSchemaUtils.toJson(message);
        return new String(jsonBytes);
    }

    @Override
    public Bytes read(String topic, String value, ParsedSchema parsedSchema) {
        ProtobufSchema protobufSchema = (ProtobufSchema) parsedSchema;
        DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
        try {
            JsonFormat.parser().merge(value, builder);
            byte[] serialized = protobufSerializer.serialize(topic, builder.build());
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
