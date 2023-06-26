package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.serde.KouncilSchemaMetadata;
import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import java.io.IOException;
import java.util.Optional;
import lombok.Getter;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SchemaRegistryFacade {

    @Getter
    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaRegistryFacade(SchemaRegistryClient schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }

    @SneakyThrows
    public MessageFormat getSchemaFormat(KouncilSchemaMetadata metadata) {
        return MessageFormat.valueOf(getSchemaByTopicAndId(metadata).schemaType());
    }

    /**
     * This method is not using Schema cache to fetch the latest metadata
     */
    public Optional<SchemaMetadata> getLatestSchemaMetadata(String topic, boolean isKey) {
        final String subject = topic.concat(TopicUtils.getSubjectSuffix(isKey));
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
    @SneakyThrows
    public ParsedSchema getSchemaByTopicAndId(KouncilSchemaMetadata metadata) {
        final String subject = metadata.getSchemaTopic().concat(TopicUtils.getSubjectSuffix(metadata.isKey()));
        return schemaRegistryClient.getSchemaBySubjectAndId(subject, metadata.getSchemaId());
    }


    public void deleteSchema(String subject, String version) throws RestClientException, IOException {
        log.info("Delete schema [subject={}, version={}]", subject, version);
        schemaRegistryClient.deleteSchemaVersion(subject, version);
    }
}
