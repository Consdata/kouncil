package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
import com.consdata.kouncil.serde.deserialization.SchemaDeserializer;
import com.consdata.kouncil.serde.serialization.SchemaSerializer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

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
        return schemaSerializer.serialize(clusterAwareSchema, topicName, key, value);
    }
}
