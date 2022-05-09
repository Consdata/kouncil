package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.deserialization.DeserializedData;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

public class SchemaMessageSerde {
    public DeserializedData deserialize(SchemaAwareCluster schemaAwareCluster, Bytes payload, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = schemaAwareCluster.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        MessageFormatter formatter = schemaAwareCluster.getFormatter(messageFormat);

        return DeserializedData.builder()
                .deserialized(formatter.deserialize(DeserializationData.builder()
                        .value(payload.get())
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .build()))
                .messageFormat(formatter.getFormat())
                .schemaId(kouncilSchemaMetadata.getSchemaId())
                .build();
    }

    public Bytes serialize(SchemaAwareCluster schemaAwareCluster, String payload, KouncilSchemaMetadata kouncilSchemaMetadata) {
        MessageFormat messageFormat = schemaAwareCluster.getSchemaRegistryFacade().getSchemaFormat(kouncilSchemaMetadata);
        ParsedSchema schema = schemaAwareCluster.getSchemaRegistryFacade().getSchemaByTopicAndId(kouncilSchemaMetadata);
        MessageFormatter formatter = schemaAwareCluster.getFormatter(messageFormat);

        return formatter.serialize(
                SerializationData.builder().payload(payload)
                        .topicName(kouncilSchemaMetadata.getSchemaTopic())
                        .schema(schema)
                        .isKey(kouncilSchemaMetadata.isKey())
                .build()
        );
    }
}
