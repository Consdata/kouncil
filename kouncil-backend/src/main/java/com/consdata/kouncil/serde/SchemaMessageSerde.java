package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
import com.consdata.kouncil.serde.deserialization.SchemaDeserializer;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

public class SchemaMessageSerde {
    private final ClusterAwareSchemaService clusterAwareSchemaService;
    private final SchemaDeserializer schemaDeserializer;

    public SchemaMessageSerde(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
        this.schemaDeserializer = new SchemaDeserializer();
    }

    public DeserializedValue deserialize(String serverId,
                                         ConsumerRecord<Bytes, Bytes> message) {
        ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(serverId);
        return schemaDeserializer.deserialize(clusterAwareSchema, message);
    }

    public Bytes serialize(ClusterAwareSchema clusterAwareSchema, String value, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = clusterAwareSchema.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        ParsedSchema schema = clusterAwareSchema.getSchemaRegistryFacade().getSchemaByTopicAndId(kouncilSchemaMetadata);
        MessageFormatter formatter = clusterAwareSchema.getFormatter(messageFormat);

        return formatter.serialize(SerializationData.builder().value(value)
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .schema(schema)
                .build());
    }
}
