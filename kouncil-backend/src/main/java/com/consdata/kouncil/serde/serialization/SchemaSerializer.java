package com.consdata.kouncil.serde.serialization;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.util.Optional;

public class SchemaSerializer {
    public ProducerRecord<Bytes, Bytes> serialize(ClusterAwareSchema clusterAwareSchema, String topicName, String key, String value) {
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
                keyFormatter.serialize(SerializationData.builder()
                        .topicName(topicName)
                        .value(key)
                        .schema(parsedKeySchema)
                        .build()),
                valueFormatter.serialize(SerializationData.builder()
                        .topicName(topicName)
                        .value(value)
                        .schema(parsedValueSchema)
                        .build()));
    }

    private MessageFormatter getFormatter(ClusterAwareSchema clusterAwareSchema, String topic, boolean isKey, Integer keySchemaId) {
        MessageFormat messageFormat = Optional.ofNullable(keySchemaId)
                .map(schemaId -> clusterAwareSchema
                        .getSchemaRegistryFacade()
                        .getSchemaFormat(topic, schemaId, isKey))
                .orElse(MessageFormat.STRING);
        return clusterAwareSchema.getFormatter(messageFormat);
    }
}
