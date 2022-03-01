package com.consdata.kouncil.serde.deserialization;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

@Service
public class DeserializationService {

    private final SchemaRegistryClient schemaRegistryClient;

    public DeserializationService(SchemaRegistryClient schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }

    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message) {
        MessageFormat keyFormat = getSchemaForKey(message.topic());

        // new MessageDeserializer(schemaRegistryClient) etc.

        MessageFormat valueFormat = getSchemaForValue(message.topic());

        return null;
    }

    private MessageFormat getSchemaForKey(String topic) {
        // TODO pobranie ze schema registry
        return MessageFormat.PROTOBUF;
    }

    private MessageFormat getSchemaForValue(String topic) {
        // TODO pobranie ze schema registry
        return MessageFormat.PROTOBUF;
    }
}
