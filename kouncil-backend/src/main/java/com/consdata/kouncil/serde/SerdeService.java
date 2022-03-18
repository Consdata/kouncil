package com.consdata.kouncil.serde;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schemaregistry.SchemaRegistryClientBuilder;
import com.consdata.kouncil.schemaregistry.SchemaRegistryService;
import com.consdata.kouncil.serde.formatter.*;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SerdeService {
    private final Map<String, ClusterAwareSchema> clusterAwareSchema = new ConcurrentHashMap<>();
    private final KouncilConfiguration kouncilConfiguration;
    private final StringMessageFormatter stringMessageFormatter;
    private final StringMessageSerde stringMessageSerde;
    private final SchemaMessageSerde schemaMessageSerde;

    public SerdeService(KouncilConfiguration kouncilConfiguration) {
        this.kouncilConfiguration = kouncilConfiguration;
        this.stringMessageFormatter = new StringMessageFormatter();
        this.stringMessageSerde = new StringMessageSerde(stringMessageFormatter);
        this.schemaMessageSerde = new SchemaMessageSerde();
    }

    @PostConstruct
    public void init() {
        this.kouncilConfiguration.getClusterConfig().forEach((clusterKey, clusterValue) -> {
            SchemaRegistryClient schemaRegistryClient = clusterValue.getSchemaRegistry() != null ?
                    SchemaRegistryClientBuilder.build(clusterValue.getSchemaRegistry()) : null;

            if (schemaRegistryClient != null) {
                SchemaRegistryService schemaRegistryService = new SchemaRegistryService(schemaRegistryClient);
                this.clusterAwareSchema.put(clusterKey, initializeClusterAwareSchema(schemaRegistryService));
            }
        });
    }

    public DeserializedValue deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        if (this.clusterAwareSchema.containsKey(clusterId)) {
            ClusterAwareSchema clusterAwareSchema = this.clusterAwareSchema.get(clusterId);
            return schemaMessageSerde.deserialize(clusterAwareSchema, message);
        } else {
            return stringMessageSerde.deserialize(message);
        }
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
