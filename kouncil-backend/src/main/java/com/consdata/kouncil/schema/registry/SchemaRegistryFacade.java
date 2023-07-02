package com.consdata.kouncil.schema.registry;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.schema.SchemaDTO;
import com.consdata.kouncil.serde.KouncilSchemaMetadata;
import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.avro.AvroSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.json.JsonSchema;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
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
        schemaRegistryClient.reset();
    }

    public SchemaMetadata getLatestSchema(String subject) throws RestClientException, IOException {
        return schemaRegistryClient.getLatestSchemaMetadata(subject);
    }

    public void updateSchema(SchemaDTO schema) throws RestClientException, IOException {
        schemaRegistryClient.register(schema.getSubjectName(), getSchema(schema.getMessageFormat(), schema.getPlainTextSchema()), true);
    }

    private ParsedSchema getSchema(MessageFormat messageFormat, String schema) {
        ParsedSchema parsedSchema;
        switch (messageFormat) {
            case JSON -> parsedSchema = new JsonSchema(schema);
            case AVRO -> parsedSchema = new AvroSchema(schema);
            case PROTOBUF -> parsedSchema = new ProtobufSchema(schema);
            default -> throw new IllegalStateException("Unexpected value: " + messageFormat);
        }
        return parsedSchema;
    }

    public void createSchema(SchemaDTO schema) throws RestClientException, IOException {
        String subject = schema.getTopicName().concat(TopicUtils.getSubjectSuffix(schema.getIsKey()));
        if (getLatestSchemaMetadata(schema.getTopicName(), schema.getIsKey()).isEmpty()) {
            schemaRegistryClient.register(subject, getSchema(schema.getMessageFormat(), schema.getPlainTextSchema()), true);
        } else {
            throw new KouncilRuntimeException(String.format("Schema for subject %s already exist", subject));
        }
    }
}
