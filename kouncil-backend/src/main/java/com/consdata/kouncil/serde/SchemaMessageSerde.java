package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.nio.ByteBuffer;
import java.util.Optional;

public class SchemaMessageSerde {
    private final ClusterAwareSchemaService clusterAwareSchemaService;

    public SchemaMessageSerde(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
    }

    public DeserializedValue deserialize(String serverId,
                                         ConsumerRecord<Bytes, Bytes> message) {
        var builder = DeserializedValue.builder();
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);

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

    public ProducerRecord<Bytes, Bytes> serialize(String serverId, String topicName, String key, String value) {
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);
        Integer keySchemaId = clusterAwareSchema.getSchemaRegistryFacade()
                .getLatestSchemaMetadata(topicName, true)
                .map(SchemaMetadata::getId)
                .orElse(null);
        MessageFormatter keyFormatter = getFormatter(clusterAwareSchema, topicName, true, keySchemaId);
        ParsedSchema parsedKeySchema = null;
        if (keyFormatter.getFormat() != MessageFormat.STRING) {
            parsedKeySchema = clusterAwareSchema.getSchemaRegistryFacade().getSchemaByTopicAndId(topicName, keySchemaId, true);
        }

        Integer valueSchemaId = clusterAwareSchema.getSchemaRegistryFacade()
                .getLatestSchemaMetadata(topicName, false)
                .map(SchemaMetadata::getId)
                .orElse(null);
        MessageFormatter valueFormatter = getFormatter(clusterAwareSchema, topicName, false, valueSchemaId);

        ParsedSchema parsedValueSchema = null;
        if (valueFormatter.getFormat() != MessageFormat.STRING) {
            parsedValueSchema = clusterAwareSchema.getSchemaRegistryFacade().getSchemaByTopicAndId(topicName, valueSchemaId, false);
        }

        return new ProducerRecord<>(topicName,
                keyFormatter.read(topicName, key, parsedKeySchema),
                valueFormatter.read(topicName, value, parsedValueSchema));
    }

    private MessageFormatter getFormatter(ClusterAwareSchema clusterAwareSchema, String topic, boolean isKey, Integer keySchemaId) {
        MessageFormat messageFormat = Optional.ofNullable(keySchemaId)
                .map(schemaId -> clusterAwareSchema
                        .getSchemaRegistryFacade()
                        .getSchemaFormat(topic, schemaId, isKey))
                .orElse(MessageFormat.STRING);
        return clusterAwareSchema.getFormatter(messageFormat);
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new.
     */
    private Integer getSchemaIdFromMessage(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        if (buffer.hasRemaining()) {
            return buffer.get() == 0 ? buffer.getInt() : null;
        }
        return null;
    }
}
