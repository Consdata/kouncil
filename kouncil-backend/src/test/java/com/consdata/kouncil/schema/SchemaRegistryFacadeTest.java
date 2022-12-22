package com.consdata.kouncil.schema;

import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.KouncilSchemaMetadata;
import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.client.rest.exceptions.RestClientException;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SchemaRegistryFacadeTest {

    @Mock
    private MockSchemaRegistryClient mockSchemaRegistryClient;

    @InjectMocks
    private SchemaRegistryFacade schemaRegistryFacade;

    private SchemaMetadata schemaMetadata;
    private ParsedSchema parsedProtobufSchema;

    @BeforeEach
    @SneakyThrows
    public void before() {
        schemaMetadata = new SchemaMetadata(1, 1, MessageFormat.PROTOBUF.name(), Collections.emptyList(), "TODO");
        parsedProtobufSchema = new ProtobufSchema(
                Files.readString(
                        Paths.get(
                                SchemaRegistryFacadeTest.class.getClassLoader().getResource("SimpleMessage.proto").toURI()
                        )
                )
        );
    }

    @Test
    @SneakyThrows
    void should_get_latest_value_schema() {
        // given
        when(mockSchemaRegistryClient.getLatestSchemaMetadata("test-topic-value")).thenReturn(schemaMetadata);

        // when
        Optional<SchemaMetadata> schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", false);

        // then
        assertThat(schemaMetadata).isPresent();
    }

    @Test
    @SneakyThrows
    void should_get_latest_key_schema() {
        // given
        when(mockSchemaRegistryClient.getLatestSchemaMetadata("test-topic-key")).thenReturn(schemaMetadata);

        // when
        Optional<SchemaMetadata> schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", true);

        // then
        assertThat(schemaMetadata).isPresent();
    }

    @Test
    @SneakyThrows
    void should_return_empty_schema_when_rest_exception() {
        // given
        when(mockSchemaRegistryClient.getLatestSchemaMetadata("test-topic-key"))
                .thenThrow(new RestClientException("", 404, 404));

        // when
        Optional<SchemaMetadata> schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", true);

        // then
        assertThat(schemaMetadata).isEmpty();
    }

    @Test
    @SneakyThrows
    void should_return_empty_schema_when_io_exception() {
        // given
        when(mockSchemaRegistryClient.getLatestSchemaMetadata("test-topic-key"))
                .thenThrow(new IOException());

        // when
        Optional<SchemaMetadata> schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", true);

        // then
        assertThat(schemaMetadata).isEmpty();
    }

    @Test
    @SneakyThrows
    void should_get_key_schema_format() {
        // given
        when(mockSchemaRegistryClient.getSchemaBySubjectAndId("test-topic-key", 1)).thenReturn(parsedProtobufSchema);

        // when
        MessageFormat schemaFormat = schemaRegistryFacade.getSchemaFormat(
                KouncilSchemaMetadata.builder()
                        .schemaTopic("test-topic")
                        .schemaId(1)
                        .isKey(true)
                        .build()
        );

        // then
        assertThat(schemaFormat).isEqualTo(MessageFormat.PROTOBUF);
    }

    @Test
    @SneakyThrows
    void should_get_value_schema_format() {
        // given
        when(mockSchemaRegistryClient.getSchemaBySubjectAndId("test-topic-value", 1)).thenReturn(parsedProtobufSchema);

        // when
        MessageFormat schemaFormat = schemaRegistryFacade.getSchemaFormat(
                KouncilSchemaMetadata.builder()
                        .schemaTopic("test-topic")
                        .schemaId(1)
                        .isKey(false)
                        .build()
        );

        // then
        assertThat(schemaFormat).isEqualTo(MessageFormat.PROTOBUF);
    }
}
