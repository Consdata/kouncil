package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import lombok.Getter;
import lombok.SneakyThrows;

import java.io.IOException;

public class SchemaRegistryService {
    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";

    @Getter
    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaRegistryService(SchemaRegistryClient schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }

    @SneakyThrows
    public MessageFormat getSchemaFormat(String topic, Integer schemaId, boolean isKey) {
        return MessageFormat.valueOf(getSchemaBySubjectAndId(topic, schemaId, isKey).schemaType());
    }

    @SneakyThrows
    public SchemaMetadata getLatestSchema(String topic, boolean isKey) {
        final String subjectSuffix = isKey ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
        return schemaRegistryClient.getLatestSchemaMetadata(topic.concat(subjectSuffix));
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    private ParsedSchema getSchemaBySubjectAndId(String topic, int id, boolean isKey) throws RestClientException, IOException {
        final String subjectSuffix = isKey ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
        return schemaRegistryClient.getSchemaBySubjectAndId(topic.concat(subjectSuffix), id);
    }

}
