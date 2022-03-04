package com.consdata.kouncil.serde;

import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.rest.entities.SchemaReference;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import lombok.SneakyThrows;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public class MockSchemaRegistry implements SchemaRegistryClient {
    @Override
    public Optional<ParsedSchema> parseSchema(String schemaType, String schemaString, List<SchemaReference> references) {
        return Optional.empty();
    }

    @Override
    public int register(String subject, ParsedSchema schema) throws IOException, RestClientException {
        return 0;
    }

    @Override
    public int register(String subject, ParsedSchema schema, int version, int id) throws IOException, RestClientException {
        return 0;
    }

    @Override
    public ParsedSchema getSchemaById(int id) throws IOException, RestClientException {
        return null;
    }

    @SneakyThrows
    @Override
    public ParsedSchema getSchemaBySubjectAndId(String subject, int id) {
        if (id == 1) {
            // protobuf
            var protobufSchemaPath = Paths.get(MockSchemaRegistry.class.getClassLoader()
                    .getResource("SimpleMessage.proto").toURI());
            return new ProtobufSchema(Files.readString(protobufSchemaPath));
        } else if (id == 2) {
            // avro
        } else if (id == 3) {
            // json schema
        }
        return null;
    }

    @Override
    public Collection<String> getAllSubjectsById(int id) throws IOException, RestClientException {
        return null;
    }

    @Override
    public SchemaMetadata getLatestSchemaMetadata(String subject) throws IOException, RestClientException {
        return null;
    }

    @Override
    public SchemaMetadata getSchemaMetadata(String subject, int version) throws IOException, RestClientException {
        return null;
    }

    @Override
    public int getVersion(String subject, ParsedSchema schema) throws IOException, RestClientException {
        return 0;
    }

    @Override
    public List<Integer> getAllVersions(String subject) throws IOException, RestClientException {
        return null;
    }

    @Override
    public boolean testCompatibility(String subject, ParsedSchema schema) throws IOException, RestClientException {
        return false;
    }

    @Override
    public String updateCompatibility(String subject, String compatibility) throws IOException, RestClientException {
        return null;
    }

    @Override
    public String getCompatibility(String subject) throws IOException, RestClientException {
        return null;
    }

    @Override
    public String setMode(String mode) throws IOException, RestClientException {
        return null;
    }

    @Override
    public String setMode(String mode, String subject) throws IOException, RestClientException {
        return null;
    }

    @Override
    public String getMode() throws IOException, RestClientException {
        return null;
    }

    @Override
    public String getMode(String subject) throws IOException, RestClientException {
        return null;
    }

    @Override
    public Collection<String> getAllSubjects() throws IOException, RestClientException {
        return null;
    }

    @Override
    public int getId(String subject, ParsedSchema schema) throws IOException, RestClientException {
        return 0;
    }

    @Override
    public void reset() {

    }
}
