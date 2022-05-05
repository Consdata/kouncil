package com.consdata.kouncil.serde;

import com.consdata.kouncil.schema.clusteraware.ClusterAwareSchemaService;
import com.consdata.kouncil.serde.formatter.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

@Service
public class SerdeService {
    private final ClusterAwareSchemaService clusterAwareSchemaService;
    private final StringMessageSerde stringMessageSerde;
    private final SchemaMessageSerde schemaMessageSerde;

    public SerdeService(ClusterAwareSchemaService clusterAwareSchemaService) {
        this.clusterAwareSchemaService = clusterAwareSchemaService;
        this.stringMessageSerde = new StringMessageSerde(new StringMessageFormatter());
        this.schemaMessageSerde = new SchemaMessageSerde(clusterAwareSchemaService);
    }

    public DeserializedValue deserialize(String clusterId, ConsumerRecord<Bytes, Bytes> message) {
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            return schemaMessageSerde.deserialize(clusterId, message);
        } else {
            return stringMessageSerde.deserialize(message);
        }
    }

    public ProducerRecord<Bytes, Bytes> serialize(String clusterId, String topicName, String key, String value) {
        if (this.clusterAwareSchemaService.clusterHasSchemaRegistry(clusterId)) {
            return schemaMessageSerde.serialize(clusterId, topicName, key, value);
        } else {
            return stringMessageSerde.serialize(topicName, key, value);
        }
    }
}
