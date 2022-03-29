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
import java.util.Optional;

@Slf4j
public class SchemaRegistryFacade {
    private static final String KEY_SCHEMA_SUFFIX = "-key";
    private static final String VALUE_SCHEMA_SUFFIX = "-value";

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
    public Optional<SchemaMetadata> getLatestSchemaMetadata(String topic, boolean isKey) {
        final String subject = topic.concat(getSubjectSuffix(isKey));
        try {
            return Optional.ofNullable(schemaRegistryClient.getLatestSchemaMetadata(subject));
        } catch (RestClientException e) {
            log.info("Schema not found [topic={}, isKey={}]", topic, isKey);
            return Optional.empty();
        } catch (IOException e) {
            log.error("Error while fetching schema metadata for [topic={}, isKey={}]", topic, isKey, e);
            return Optional.empty();
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
