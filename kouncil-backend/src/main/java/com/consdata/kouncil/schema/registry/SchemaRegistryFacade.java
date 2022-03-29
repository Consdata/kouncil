package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import lombok.Getter;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class SchemaRegistryFacade {
    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";
    private static final SchemaMetadata DEFAULT_SCHEMA_METADATA = new SchemaMetadata(-1,
            -1,
            MessageFormat.STRING.name(),
            null,
            null);

    @Getter
    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaRegistryFacade(SchemaRegistryClient schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }

    @SneakyThrows
    public MessageFormat getSchemaFormat(String topic, Integer schemaId, boolean isKey) {
        final String subject = topic.concat(getSubjectSuffix(isKey));
        return MessageFormat.valueOf(getSchemaBySubjectAndId(subject, schemaId).schemaType());
    }

    /**
     * This method is not using Schema cache to fetch the latest metadata
     */
    public SchemaMetadata getLatestSchemaMetadata(String topic, boolean isKey) {
        final String subject = topic.concat(getSubjectSuffix(isKey));
        try {
            return schemaRegistryClient.getLatestSchemaMetadata(subject);
        } catch (RestClientException e) {
            log.info("Schema not found [topic={}, isKey={}]", topic, isKey);
            return DEFAULT_SCHEMA_METADATA;
        } catch (IOException e) {
            log.error("Error while fetching schema metadata for [topic={}, isKey={}]", topic, isKey, e);
            return DEFAULT_SCHEMA_METADATA;
        }
    }

    /**
     * This method is performance-safe, because uses Schema cache
     */
    private ParsedSchema getSchemaBySubjectAndId(String subject, int id) throws RestClientException, IOException {
        return schemaRegistryClient.getSchemaBySubjectAndId(subject, id);
    }

    private String getSubjectSuffix(boolean isKey) {
        return isKey ? KEY_SCHEMA_SUFFIX : VALUE_SCHEMA_SUFFIX;
    }
}
