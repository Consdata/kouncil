package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SchemaRegistryService {
    private static final int SCHEMA_CACHE_SIZE = 100;
    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";
    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaRegistryService(ClusterConfig clusterConfig) {
        this.schemaRegistryClient = clusterConfig.getSchemaRegistry() != null ?
                createSchemaRegistryClient(clusterConfig.getSchemaRegistry()) : null;
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    public ParsedSchema getKeySchemaBySubjectAndId(String topic, int id) throws RestClientException, IOException {
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(KEY_SCHEMA_SUFFIX), id);
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    public ParsedSchema getValueSchemaBySubjectAndId(String topic, int id) throws RestClientException, IOException {
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(VALUE_SCHEMA_SUFFIX), id);
    }

    private SchemaRegistryClient createSchemaRegistryClient(SchemaRegistryConfig schemaRegistryConfig) {
        List<SchemaProvider> schemaProviders =
                List.of(new AvroSchemaProvider(), new ProtobufSchemaProvider(), new JsonSchemaProvider());

        // Schema registry authentication should come here
        Map<String, String> configs = new HashMap<>();

        return new CachedSchemaRegistryClient(schemaRegistryConfig.getUrl(),
                SCHEMA_CACHE_SIZE,
                schemaProviders,
                configs);
    }
}
