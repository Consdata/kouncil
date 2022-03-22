package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import io.confluent.kafka.schemaregistry.client.MockSchemaRegistryClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import io.confluent.kafka.schemaregistry.protobuf.ProtobufSchema;
import lombok.SneakyThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
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
        when(mockSchemaRegistryClient.getLatestSchemaMetadata(eq("test-topic-value"))).thenReturn(schemaMetadata);

        // when
        SchemaMetadata schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", false);

        // then
        assertThat(schemaMetadata).isNotNull();
    }

    @Test
    @SneakyThrows
    void should_get_latest_key_schema() {
        // given
        when(mockSchemaRegistryClient.getLatestSchemaMetadata(eq("test-topic-key"))).thenReturn(schemaMetadata);

        // when
        SchemaMetadata schemaMetadata = schemaRegistryFacade.getLatestSchemaMetadata("test-topic", true);

        // then
        assertThat(schemaMetadata).isNotNull();
    }

    @Test
    @SneakyThrows
    void should_get_key_schema_format() {
        // given
        when(mockSchemaRegistryClient.getSchemaBySubjectAndId(eq("test-topic-key"), eq(1))).thenReturn(parsedProtobufSchema);

        // when
        MessageFormat schemaFormat = schemaRegistryFacade.getSchemaFormat("test-topic", 1, true);

        // then
        assertThat(schemaFormat).isEqualTo(MessageFormat.PROTOBUF);
    }

    @Test
    @SneakyThrows
    void should_get_value_schema_format() {
        // given
        when(mockSchemaRegistryClient.getSchemaBySubjectAndId(eq("test-topic-value"), eq(1))).thenReturn(parsedProtobufSchema);

        // when
        MessageFormat schemaFormat = schemaRegistryFacade.getSchemaFormat("test-topic", 1, false);

        // then
        assertThat(schemaFormat).isEqualTo(MessageFormat.PROTOBUF);
    }
}
