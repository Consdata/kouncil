package com.consdata.kouncil.schema.clusteraware;

import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.schema.registry.SchemaRegistryClientBuilder;
import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.formatter.schema.AvroMessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.JsonSchemaMessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.MessageFormatter;
import com.consdata.kouncil.serde.formatter.schema.ProtobufMessageFormatter;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ClusterAwareSchemaService {
    private final Map<String, SchemaAwareCluster> clusterAwareSchema = new ConcurrentHashMap<>();

    public ClusterAwareSchemaService(KouncilConfiguration kouncilConfiguration) {
        kouncilConfiguration.getClusterConfig().forEach((clusterKey, clusterValue) -> {
            SchemaRegistryClient schemaRegistryClient = clusterValue.getSchemaRegistry() != null ?
                    SchemaRegistryClientBuilder.build(clusterValue.getSchemaRegistry()) : null;

            if (schemaRegistryClient != null) {
                SchemaRegistryFacade schemaRegistryFacade = new SchemaRegistryFacade(schemaRegistryClient);
                this.clusterAwareSchema.put(clusterKey, initializeSchemaAwareCluster(schemaRegistryFacade));
            }
        });
    }

    public SchemaAwareCluster getClusterSchema(String serverId) {
        return clusterAwareSchema.get(serverId);
    }

    public boolean clusterHasSchemaRegistry(String serverId) {
        return clusterAwareSchema.containsKey(serverId);
    }

    private SchemaAwareCluster initializeSchemaAwareCluster(SchemaRegistryFacade schemaRegistryFacade) {
        EnumMap<MessageFormat, MessageFormatter> formatters = new EnumMap<>(MessageFormat.class);
        formatters.put(MessageFormat.PROTOBUF, new ProtobufMessageFormatter(schemaRegistryFacade.getSchemaRegistryClient()));
        formatters.put(MessageFormat.AVRO, new AvroMessageFormatter());
        formatters.put(MessageFormat.JSON_SCHEMA, new JsonSchemaMessageFormatter());
        return SchemaAwareCluster.builder()
                .formatters(formatters)
                .schemaRegistryFacade(schemaRegistryFacade)
                .build();
    }
}
