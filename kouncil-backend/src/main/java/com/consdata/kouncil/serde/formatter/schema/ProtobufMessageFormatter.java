package com.consdata.kouncil.serde.formatter.schema;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import com.google.protobuf.DynamicMessage;
import com.google.protobuf.Message;
import com.google.protobuf.util.JsonFormat;
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
    public String deserialize(DeserializationData deserializationData) {
        final Message message = protobufDeserializer.deserialize(
                deserializationData.getTopicName(),
                deserializationData.getValue()
        );
        try {
            return new String(ProtobufSchemaUtils.toJson(message));
        } catch (IOException e) {
            throw new RuntimeException("Failed to deserialize record for topic " + deserializationData.getTopicName(), e);
        }
    }

    @Override
    public Bytes serialize(SerializationData serializationData) {
        ProtobufSchema protobufSchema = (ProtobufSchema) serializationData.getSchema();
        DynamicMessage.Builder builder = protobufSchema.newMessageBuilder();
        try {
            JsonFormat.parser().merge(serializationData.getPayload(), builder);
            byte[] serialized = protobufSerializer.serialize(serializationData.getTopicName(), builder.build());
            return Bytes.wrap(serialized);
        } catch (Throwable e) {
            throw new RuntimeException("Failed to serialize record for topic " + serializationData.getTopicName(), e);
        }
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.PROTOBUF;
    }
}
