package com.consdata.kouncil.schemaregistry;

import com.consdata.kouncil.MockSchemaRegistryKouncilClient;
import io.confluent.kafka.schemaregistry.client.SchemaMetadata;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SchemaRegistryServiceTest {
    private final SchemaRegistryService schemaRegistryService = new SchemaRegistryService(
            new MockSchemaRegistryKouncilClient()
    );

    @Test
    void should_get_latest_schema() {
        // given

        // when
        SchemaMetadata schemaMetadata = schemaRegistryService.getLatestSchema("test-topic", false);

        // then
        assertThat(schemaMetadata).isNotNull();
    }
}
