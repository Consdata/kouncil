package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.deserialization.NewDeserializedData;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

public class SchemaMessageSerde {
    public NewDeserializedData deserialize(ClusterAwareSchema clusterAwareSchema, Bytes value, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = clusterAwareSchema.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        MessageFormatter formatter = clusterAwareSchema.getFormatter(messageFormat);

        return NewDeserializedData.builder()
                .deserializedValue(formatter.deserialize(DeserializationData.builder()
                        .value(value.get())
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .build()))
                .valueFormat(messageFormat)
                .schemaId(kouncilSchemaMetadata.getSchemaId())
                .build();
    }

    public Bytes serialize(ClusterAwareSchema clusterAwareSchema, String value, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = clusterAwareSchema.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        ParsedSchema schema = clusterAwareSchema.getSchemaRegistryFacade().getSchemaByTopicAndId(kouncilSchemaMetadata);
        MessageFormatter formatter = clusterAwareSchema.getFormatter(messageFormat);

        return formatter.serialize(
                SerializationData.builder().value(value)
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .schema(schema)
                .build()
        );
    }
}
