package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
import com.consdata.kouncil.serde.deserialization.SchemaDeserializer;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SchemaSerializer;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.util.Optional;

public class SchemaMessageSerde {
    private final ClusterAwareSchemaService clusterAwareSchemaService;
    private final SchemaSerializer schemaSerializer;
    private final SchemaDeserializer schemaDeserializer;

    public SchemaMessageSerde(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
        this.schemaSerializer = new SchemaSerializer();
        this.schemaDeserializer = new SchemaDeserializer();
    }

    public DeserializedValue deserialize(String serverId,
                                         ConsumerRecord<Bytes, Bytes> message) {
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);
        return schemaDeserializer.deserialize(clusterAwareSchema, message);
    }

    public ProducerRecord<Bytes, Bytes> serialize(String serverId, String topicName, String key, String value) {
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);
        Integer keySchemaId = clusterAwareSchema.getSchemaRegistryFacade()
                .getLatestSchemaMetadata(topicName, true)
                .map(SchemaMetadata::getId)
                .orElse(null);
        MessageFormatter keyFormatter = getFormatter(clusterAwareSchema, topicName, true, keySchemaId);

        return schemaSerializer.serialize(clusterAwareSchema, topicName, key, value);
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
