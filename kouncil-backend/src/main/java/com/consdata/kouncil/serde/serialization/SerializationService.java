package com.consdata.kouncil.serde.serialization;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.KouncilSchemaMetadata;
import com.consdata.kouncil.serde.SchemaMessageSerde;
import com.consdata.kouncil.serde.StringMessageSerde;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SerializationService {
    private final SchemaAwareClusterService schemaAwareClusterService;
    private final StringMessageSerde stringMessageSerde;
    private final SchemaMessageSerde schemaMessageSerde;

    public SerializationService(SchemaAwareClusterService schemaAwareClusterService,
                                StringMessageSerde stringMessageSerde,
                                SchemaMessageSerde schemaMessageSerde) {
        this.schemaAwareClusterService = schemaAwareClusterService;
        this.stringMessageSerde = stringMessageSerde;
        this.schemaMessageSerde = schemaMessageSerde;
    }

    public ProducerRecord<Bytes, Bytes> serialize(String clusterId, String topicName, @NotNull String key, @NotNull String value) {
        Bytes serializedKey;
        Bytes serializedValue;
        if (this.schemaAwareClusterService.clusterHasSchemaRegistry(clusterId)) {
            SchemaAwareCluster schemaAwareCluster = schemaAwareClusterService.getClusterSchema(clusterId);
            serializedKey = getSchemaSerializedData(topicName, key, true, schemaAwareCluster);
            serializedValue = getSchemaSerializedData(topicName, value, false, schemaAwareCluster);
        } else {
            serializedKey = stringMessageSerde.serialize(key);
            serializedValue = stringMessageSerde.serialize(value);
        }
        return new ProducerRecord<>(topicName, serializedKey, serializedValue);
    }

    private Bytes getSchemaSerializedData(String topicName, String payload, boolean isKey, SchemaAwareCluster schemaAwareCluster) {
        Bytes serializedData;
        serializedData = getSchemaIdFromRegistry(schemaAwareCluster, topicName, isKey)
                .map(schemaId -> schemaMessageSerde.serialize(schemaAwareCluster, payload, KouncilSchemaMetadata.builder()
                        .isKey(isKey)
                        .schemaId(schemaId)
                        .schemaTopic(topicName)
                        .build()))
                .orElseGet(() -> stringMessageSerde.serialize(payload));
        return serializedData;
    }

    private Optional<Integer> getSchemaIdFromRegistry(SchemaAwareCluster schemaAwareCluster, String topicName, boolean isKey) {
        return schemaAwareCluster.getSchemaRegistryFacade()
                .getLatestSchemaMetadata(topicName, isKey)
                .map(SchemaMetadata::getId);
    }
}
