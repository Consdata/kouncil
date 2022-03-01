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
import org.apache.kafka.common.utils.Bytes;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public ParsedSchema getKeySchemaById(String topic, int id) throws RestClientException, IOException {
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(KEY_SCHEMA_SUFFIX), id);
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    public ParsedSchema getValueSchemaById(String topic, int id) throws RestClientException, IOException {
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(VALUE_SCHEMA_SUFFIX), id);
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new for this record.
     */
    public Optional<Integer> getSchemaId(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        return buffer.get() == 0 ? Optional.of(buffer.getInt()) : Optional.empty();
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
