package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.MessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.nio.ByteBuffer;
import java.util.Optional;

public class SchemaMessageSerde {
    public DeserializedValue deserialize(ClusterAwareSchema clusterAwareSchema,
                                          ConsumerRecord<Bytes, Bytes> message) {
        var builder = DeserializedValue.builder();
        if (message.key() != null) {
            Integer keySchemaId = getSchemaIdFromMessage(message.key());
            MessageFormatter keyFormatter = getFormatter(clusterAwareSchema, message.topic(), true, keySchemaId);

            builder.deserializedKey(keyFormatter.format(message.topic(), message.key().get()))
                    .keyFormat(keyFormatter.getFormat())
                    .keySchemaId(Optional.ofNullable(keySchemaId).map(String::valueOf).orElse(null));
        }
        if (message.value() != null) {
            Integer valueSchemaId = getSchemaIdFromMessage(message.value());
            MessageFormatter valueFormatter = getFormatter(clusterAwareSchema, message.topic(), false, valueSchemaId);
            builder.deserializedValue(valueFormatter.format(message.topic(), message.value().get()))
                    .valueFormat(valueFormatter.getFormat())
                    .valueSchemaId(Optional.ofNullable(valueSchemaId).map(String::valueOf).orElse(null));
        }
        return builder.build();
    }

    private MessageFormatter getFormatter(ClusterAwareSchema clusterAwareSchema, String topic, boolean isKey, Integer keySchemaId) {
        MessageFormat messageFormat = Optional.ofNullable(keySchemaId)
                .map(schemaId -> clusterAwareSchema.getSchemaFormat(topic, schemaId, isKey))
                .orElse(MessageFormat.STRING);
        return clusterAwareSchema.getFormatter(messageFormat);
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new.
     */
    private Integer getSchemaIdFromMessage(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        return buffer.get() == 0 ? buffer.getInt() : null;
    }
}
