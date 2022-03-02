package com.consdata.kouncil.serde;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schemaregistry.SchemaRegistryService;
import com.consdata.kouncil.serde.formatter.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.nio.ByteBuffer;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SerdeService {
    private final Map<String, ClusterAwareSchema> clusterAwareSchema = new ConcurrentHashMap<>();
    private final KouncilConfiguration kouncilConfiguration;
    private final StringMessageFormatter stringMessageFormatter;

    public SerdeService(KouncilConfiguration kouncilConfiguration) {
        this.kouncilConfiguration = kouncilConfiguration;
        this.stringMessageFormatter = new StringMessageFormatter();
    }

    @PostConstruct
    public void init() {
        this.kouncilConfiguration.getClusterConfig().forEach((clusterKey, clusterValue) -> {
            SchemaRegistryService schemaRegistryService = new SchemaRegistryService(clusterValue);

            if (schemaRegistryService.getSchemaRegistryClient() != null) {
                this.clusterAwareSchema.put(clusterKey, initializeClusterAwareSchema(schemaRegistryService));
            }
        });
    }

    public DeserializedValue deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        ClusterAwareSchema clusterAwareSchema = this.clusterAwareSchema.get(clusterId);
        MessageSerde messageSerde;
        if (clusterAwareSchema == null) {
            messageSerde = new StringMessageSerde();
            return messageSerde.deserialize(message, stringMessageFormatter, stringMessageFormatter);
        } else {
            messageSerde = new SchemaMessageSerde();

            MessageFormat keyMessageFormat = getFormat(clusterAwareSchema.getSchemaRegistryService(),
                    message.topic(), message.key(), true);

            MessageFormat valueMessageFormat = getFormat(clusterAwareSchema.getSchemaRegistryService(),
                    message.topic(), message.value(), false);

            return messageSerde.deserialize(
                    message,
                    clusterAwareSchema.getFormatters().get(keyMessageFormat),
                    clusterAwareSchema.getFormatters().get(valueMessageFormat)
            );
        }
    }

    private MessageFormat getFormat(SchemaRegistryService schemaRegistryService, String topic, Bytes value, boolean isKey) {
        return getSchemaId(value)
                .map(schemaId -> schemaRegistryService.getSchemaFormat(topic, schemaId, isKey))
                .orElse(MessageFormat.STRING);
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new for this record.
     * @param message
     * @return schema identifier
     */
    private Optional<Integer> getSchemaId(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        return buffer.get() == 0 ? Optional.of(buffer.getInt()) : Optional.empty();
    }

    private ClusterAwareSchema initializeClusterAwareSchema(SchemaRegistryService schemaRegistryService) {
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryService.getSchemaRegistryClient()));
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter());
        formatters.put(MessageFormat.JSON_SCHEMA, new JsonSchemaMessageFormatter());
        formatters.put(MessageFormat.STRING, stringMessageFormatter);
        return ClusterAwareSchema.builder()
                .formatters(formatters)
                .schemaRegistryService(schemaRegistryService)
                .build();
    }
}
