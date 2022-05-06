package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
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
        this.schemaMessageSerde = new SchemaMessageSerde(clusterAwareSchemaService);
    }

    public DeserializedValue deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            return schemaMessageSerde.deserialize(clusterId, message);
        } else {
            return stringMessageSerde.deserialize(message);
        }
    }

    public ProducerRecord<Bytes, Bytes> serialize(String clusterId, String topicName, String key, String value) {
        Bytes keyBytes;
        Bytes valueBytes;
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(clusterId);

            keyBytes = getSchemaIdFromRegistry(clusterAwareSchema, topicName, true)
                    .map(keySchemaId -> schemaMessageSerde.serialize(clusterAwareSchema, key, KouncilSchemaMetadata.builder()
                                    .isKey(true)
                                    .schemaId(keySchemaId)
                                    .schemaTopic(topicName)
                            .build()))
                    .orElseGet(() -> stringMessageSerde.serialize(topicName, key));

            valueBytes = getSchemaIdFromRegistry(clusterAwareSchema, topicName, false)
                    .map(valueSchemaId -> schemaMessageSerde.serialize(clusterAwareSchema, value, KouncilSchemaMetadata.builder()
                            .isKey(false)
                            .schemaId(valueSchemaId)
                            .schemaTopic(topicName)
                            .build()))
                    .orElseGet(() -> stringMessageSerde.serialize(topicName, key));

        } else {
            keyBytes = stringMessageSerde.serialize(topicName, key);
            valueBytes = stringMessageSerde.serialize(topicName, value);
        }
        return new ProducerRecord<>(topicName, keyBytes, valueBytes);
    }

    private Optional<Integer> getSchemaIdFromRegistry(ClusterAwareSchema clusterAwareSchema, String topicName, boolean isKey) {
        return clusterAwareSchema.getSchemaRegistryFacade()
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
