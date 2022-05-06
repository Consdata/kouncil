package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchema;
import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.deserialization.DeserializedValue;
import com.consdata.kouncil.serde.deserialization.NewDeserializedData;
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

    public DeserializedValue deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        NewDeserializedData keyData = NewDeserializedData.builder().build();
        NewDeserializedData valueData = NewDeserializedData.builder().build();
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(clusterId);
            if (message.key() != null) {
                keyData = getSchemaIdFromMessage(message.key())
                        .map(keySchemaId -> schemaMessageSerde.deserialize(clusterAwareSchema, message.key(), KouncilSchemaMetadata.builder()
                                .isKey(true)
                                .schemaId(keySchemaId)
                                .schemaTopic(message.topic())
                                .build())
                        )
                        .orElse(NewDeserializedData.builder()
                                .deserialized(stringMessageSerde.deserialize(message.key()))
                                .valueFormat(MessageFormat.STRING)
                                .build()
                        );
            }
            if (message.value() != null) {
                valueData = getSchemaIdFromMessage(message.value())
                        .map(valueSchemaId -> schemaMessageSerde.deserialize(clusterAwareSchema, message.value(), KouncilSchemaMetadata.builder()
                                .isKey(false)
                                .schemaId(valueSchemaId)
                                .schemaTopic(message.topic())
                                .build())
                        )
                        .orElse(NewDeserializedData.builder()
                                .deserialized(stringMessageSerde.deserialize(message.value()))
                                .valueFormat(MessageFormat.STRING)
                                .build()
                        );
            }
        } else {
            if (message.key() != null) {
                keyData = NewDeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(message.key()))
                        .valueFormat(MessageFormat.STRING)
                        .build();
            }
            if (message.value() != null) {
                valueData = NewDeserializedData.builder()
                        .deserialized(stringMessageSerde.deserialize(message.value()))
                        .valueFormat(MessageFormat.STRING)
                        .build();
            }
        }
        return DeserializedValue.builder().keyData(keyData).valueData(valueData).build();
    }

    public ProducerRecord<Bytes, Bytes> serialize(String clusterId, String topicName, String key, String value) {
        Bytes serializedKey;
        Bytes serializedValue;
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            ClusterAwareSchema clusterAwareSchema = clusterAwareSchemaService.getClusterSchema(clusterId);

            serializedKey = getSchemaIdFromRegistry(clusterAwareSchema, topicName, true)
                    .map(keySchemaId -> schemaMessageSerde.serialize(clusterAwareSchema, key, KouncilSchemaMetadata.builder()
                                    .isKey(true)
                                    .schemaId(keySchemaId)
                                    .schemaTopic(topicName)
                            .build()))
                    .orElseGet(() -> stringMessageSerde.serialize(key));

            serializedValue = getSchemaIdFromRegistry(clusterAwareSchema, topicName, false)
                    .map(valueSchemaId -> schemaMessageSerde.serialize(clusterAwareSchema, value, KouncilSchemaMetadata.builder()
                            .isKey(false)
                            .schemaId(valueSchemaId)
                            .schemaTopic(topicName)
                            .build()))
                    .orElseGet(() -> stringMessageSerde.serialize(key));

        } else {
            serializedKey = stringMessageSerde.serialize(key);
            serializedValue = stringMessageSerde.serialize(value);
        }
        return new ProducerRecord<>(topicName, serializedKey, serializedValue);
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
