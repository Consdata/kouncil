package com.consdata.kouncil.serde;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.consdata.kouncil.schema.clusteraware.SchemaAwareClusterService;
import com.consdata.kouncil.serde.serialization.SerializationService;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest
class NoSchemaSerializationServiceTest {
    private static final String LOREM = "lorem";
    private static final String IPSUM = "ipsum";
    private static final String CLUSTER_ID = "clusterId";
    @MockitoBean
    private SchemaAwareClusterService schemaAwareClusterService;
    @Autowired
    private SerializationService serializationService;

    @Test
    void should_serialize_without_schema() {
        // given
        when(schemaAwareClusterService.clusterHasSchemaRegistry(anyString())).thenReturn(false);

        // when
        ProducerRecord<Bytes, Bytes> serializedMessage = serializationService.serialize(CLUSTER_ID, "topicName", LOREM, IPSUM);

        // then
        assertThat(serializedMessage.key()).isEqualTo(Bytes.wrap(LOREM.getBytes()));
        assertThat(serializedMessage.value()).isEqualTo(Bytes.wrap(IPSUM.getBytes()));
    }
}
