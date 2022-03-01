package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.*;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

@Service
public class SerdeService {

    private final SchemaRegistryClient schemaRegistryClient;
    private final StringMessageFormatter stringMessageFormatter;
    private final ProtobufMessageFormatter protobufMessageFormatter;
    private final AvroMessageFormatter avroMessageFormatter;
    private final JsonSchemaMessageFormatter jsonSchemaMessageFormatter;
    private final MessageSerde messageSerde;

    public SerdeService(
            // SchemaRegistryService schemaRegistryService
    ) {
        this.schemaRegistryClient = null; //schemaRegistryService.createSchemaRegistryClient()
        this.stringMessageFormatter = new StringMessageFormatter();
        this.protobufMessageFormatter = new ProtobufMessageFormatter(schemaRegistryClient);
        this.avroMessageFormatter = new AvroMessageFormatter();
        this.jsonSchemaMessageFormatter = new JsonSchemaMessageFormatter();
        this.messageSerde = schemaRegistryClient == null ? new StringMessageSerde() : new SchemaMessageSerde();
    }

    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message) {
        if (messageSerde instanceof StringMessageSerde) {
            return messageSerde.deserialize(message, stringMessageFormatter, stringMessageFormatter);
        } else {
            MessageFormatter keyFormatter = formatter(getFormatForKey(message.topic()));
            MessageFormatter valueFormatter = formatter(getFormatForValue(message.topic()));
            return messageSerde.deserialize(message, keyFormatter, valueFormatter);
        }
    }

    private MessageFormat getFormatForKey(String topic) {
        // TODO pobranie ze schema registry
        return MessageFormat.PROTOBUF;
    }

    private MessageFormat getFormatForValue(String topic) {
        // TODO pobranie ze schema registry
        return MessageFormat.PROTOBUF;
    }

    private MessageFormatter formatter(MessageFormat messageFormat) {
        switch (messageFormat) {
            case STRING:
                return stringMessageFormatter;
            case PROTOBUF:
                return protobufMessageFormatter;
            case AVRO:
                return avroMessageFormatter;
            case JSON_SCHEMA:
                return jsonSchemaMessageFormatter;
        }
        return stringMessageFormatter;
    }
}
