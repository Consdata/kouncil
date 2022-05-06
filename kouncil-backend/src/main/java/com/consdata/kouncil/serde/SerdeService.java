package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareCluster;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedMessage;
import com.consdata.kouncil.serde.deserialization.DeserializedData;
import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.util.Optional;

@Service
public class SerdeService {
    private final ClusterAwareSchemaService clusterAwareSchemaService;
    private final StringMessageSerde stringMessageSerde;
    private final SchemaMessageSerde schemaMessageSerde;

    public SerdeService(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
        this.stringMessageSerde = new StringMessageSerde(new StringMessageFormatter());
        this.schemaMessageSerde = new SchemaMessageSerde();
    }

    public DeserializedMessage deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        DeserializedData keyData = DeserializedData.builder().build();
        DeserializedData valueData = DeserializedData.builder().build();
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            SchemaAwareCluster schemaAwareCluster = clusterAwareSchemaService.getClusterSchema(clusterId);
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
                        .valueFormat(MessageFormat.STRING)
                        .build();
            }
            if (message.value() != null) {
                valueData = DeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(message.value()))
                        .valueFormat(MessageFormat.STRING)
                        .build();
            }
        }
        return DeserializedMessage.builder().keyData(keyData).valueData(valueData).build();
    }

    public ProducerRecord<Bytes, Bytes> serialize(String clusterId, String topicName, String key, String value) {
        Bytes serializedKey;
        Bytes serializedValue;
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            SchemaAwareCluster schemaAwareCluster = clusterAwareSchemaService.getClusterSchema(clusterId);
            serializedKey = getSchemaSerializedData(topicName, key, true, schemaAwareCluster);
            serializedValue = getSchemaSerializedData(topicName, value, false, schemaAwareCluster);
        } else {
            serializedKey = stringMessageSerde.serialize(key);
            serializedValue = stringMessageSerde.serialize(value);
        }
        return new ProducerRecord<>(topicName, serializedKey, serializedValue);
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
                .orElse(DeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(payload))
                        .valueFormat(MessageFormat.STRING)
                        .build()
                );
        return deserializedData;
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
