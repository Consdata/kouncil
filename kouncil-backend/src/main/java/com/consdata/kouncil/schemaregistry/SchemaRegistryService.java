package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig;
import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.SchemaProvider;
import io.confluent.kafka.schemaregistry.avro.AvroSchemaProvider;
import io.confluent.kafka.schemaregistry.client.CachedSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchemaProvider;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchemaProvider;
import lombok.Getter;
import lombok.SneakyThrows;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SchemaRegistryService {
    private static final int SCHEMA_CACHE_SIZE = 100;
    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";

    @Getter
    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaRegistryService(ClusterConfig clusterConfig) {
        this.schemaRegistryClient = clusterConfig.getSchemaRegistry() != null ?
                createSchemaRegistryClient(clusterConfig.getSchemaRegistry()) : null;
    }

    @SneakyThrows
    public MessageFormat getSchemaFormat(String topic, Integer schemaId, boolean isKey) {
        return MessageFormat.valueOf(getSchemaBySubjectAndId(topic, schemaId, isKey).schemaType());
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    private ParsedSchema getSchemaBySubjectAndId(String topic, int id, boolean isKey) throws RestClientException, IOException {
        final String subjectSuffix = isKey ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(subjectSuffix), id);
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
