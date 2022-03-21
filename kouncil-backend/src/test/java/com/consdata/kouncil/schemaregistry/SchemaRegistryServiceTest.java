package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.MockSchemaRegistryKouncilClient;
import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Objects;

import static org.assertj.core.api.Assertions.assertThat;

class SchemaRegistryServiceTest {
    private final SchemaRegistryService schemaRegistryService = new SchemaRegistryService(
            new MockSchemaRegistryKouncilClient()
    );

    @Test
    void should_get_latest_schema() throws URISyntaxException, IOException {
        // given

        // when
        ParsedSchema parsedSchema = schemaRegistryService.getLatestSchema("test-topic", false);

        // then
        assertThat(parsedSchema).isNotNull();
        assertThat(parsedSchema.schemaType()).isEqualTo(MessageFormat.PROTOBUF.name());

        var simpleMessageProtoContent = Files.readString(
                Paths.get(Objects.requireNonNull(
                        SchemaRegistryServiceTest.class.getClassLoader().getResource("SimpleMessage.proto")).toURI()
                )).trim();
        assertThat(parsedSchema.canonicalString()).isEqualTo(simpleMessageProtoContent);
    }
}
