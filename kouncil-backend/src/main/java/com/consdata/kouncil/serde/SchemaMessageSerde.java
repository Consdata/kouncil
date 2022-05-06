package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.deserialization.DeserializedData;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

public class SchemaMessageSerde {
    public DeserializedData deserialize(ClusterAwareSchema clusterAwareSchema, Bytes payload, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = clusterAwareSchema.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        MessageFormatter formatter = clusterAwareSchema.getFormatter(messageFormat);

        return DeserializedData.builder()
                .deserialized(formatter.deserialize(DeserializationData.builder()
                        .value(payload.get())
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .build()))
                .valueFormat(formatter.getFormat())
                .schemaId(kouncilSchemaMetadata.getSchemaId())
                .build();
    }

    public Bytes serialize(ClusterAwareSchema clusterAwareSchema, String payload, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = clusterAwareSchema.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        ParsedSchema schema = clusterAwareSchema.getSchemaRegistryFacade().getSchemaByTopicAndId(kouncilSchemaMetadata);
        MessageFormatter formatter = clusterAwareSchema.getFormatter(messageFormat);

        return formatter.serialize(
                SerializationData.builder().payload(payload)
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .schema(schema)
                .build()
        );
    }
}
