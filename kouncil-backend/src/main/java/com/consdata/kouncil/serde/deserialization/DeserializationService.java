package com.consdata.kouncil.serde.deserialization;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.KouncilSchemaMetadata;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.SchemaMessageSerde;
import com.consdata.kouncil.serde.StringMessageSerde;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.util.Optional;

@Service
public class DeserializationService {
    private final SchemaAwareClusterService schemaAwareClusterService;
    private final StringMessageSerde stringMessageSerde;
    private final SchemaMessageSerde schemaMessageSerde;

    public DeserializationService(SchemaAwareClusterService schemaAwareClusterService,
                                  StringMessageSerde stringMessageSerde,
                                  SchemaMessageSerde schemaMessageSerde) {
        this.schemaAwareClusterService = schemaAwareClusterService;
        this.stringMessageSerde = stringMessageSerde;
        this.schemaMessageSerde = schemaMessageSerde;
    }

    public DeserializedMessage deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        DeserializedData keyData = DeserializedData.builder().build();
        DeserializedData valueData = DeserializedData.builder().build();
        if (this.schemaAwareClusterService.clusterHasSchemaRegistry(clusterId)) {
            SchemaAwareCluster schemaAwareCluster = schemaAwareClusterService.getClusterSchema(clusterId);
            if (message.key() != null) {
                keyData = getSchemaDeserializedData(message.key(), message.topic(), true, schemaAwareCluster);
            }
            if (message.value() != null) {
                valueData = getSchemaDeserializedData(message.value(), message.topic(), false, schemaAwareCluster);
            }
        } else {
            if (message.key() != null) {
                keyData = DeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(message.key()))
                        .messageFormat(MessageFormat.STRING)
                        .build();
            }
            if (message.value() != null) {
                valueData = DeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(message.value()))
                        .messageFormat(MessageFormat.STRING)
                        .build();
            }
        }
        return DeserializedMessage.builder().keyData(keyData).valueData(valueData).build();
    }

    private DeserializedData getSchemaDeserializedData(Bytes payload, String topic, boolean isKey, SchemaAwareCluster schemaAwareCluster) {
        DeserializedData deserializedData;
        deserializedData = getSchemaIdFromMessage(payload)
                .map(schemaId -> schemaMessageSerde.deserialize(schemaAwareCluster, payload, KouncilSchemaMetadata.builder()
                        .isKey(isKey)
                        .schemaId(schemaId)
                        .schemaTopic(topic)
                        .build())
                )
                .orElseGet(() -> DeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(payload))
                        .messageFormat(MessageFormat.STRING)
                        .build()
                );
        return deserializedData;
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new.
     */
    private Optional<Integer> getSchemaIdFromMessage(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        if (buffer.hasRemaining()) {
            return buffer.get() == 0 ? Optional.of(buffer.getInt()) : Optional.empty();
        }
        return Optional.empty();
    }
}
