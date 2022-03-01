package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.formatter.ProtobufMessageFormatter;
import io.confluent.kafka.schemaregistry.client.SchemaRegistryClient;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.nio.ByteBuffer;
import java.util.Optional;

public class SchemaMessageSerde implements MessageSerde {

    private final SchemaRegistryClient schemaRegistryClient;

    public SchemaMessageSerde(SchemaRegistryClient schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }

    @Override
    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message,
                                         MessageFormatter keyFormatter,
                                         MessageFormatter valueFormatter) {
        var builder = DeserializedValue.builder();
        if (message.key() != null) {
            Optional<Integer> keySchemaId = getSchemaId(message.key());
            // TODO uderzenie po schemę dla klucza? stamtąd pozyskuję informacje o typie
            MessageFormat messageFormat = MessageFormat.PROTOBUF;

            // TODO przekazać schemaRegistryClient
            MessageFormatter keyMessageFormatter = new ProtobufMessageFormatter(null);

            builder.deserializedKey(keyMessageFormatter.format(message.topic(), message.key().get()))
                    .keyFormat(keyMessageFormatter.getFormat())
                    .keySchemaId(keySchemaId.map(String::valueOf).orElse(null));
        }
        if (message.value() != null) {
            Optional<Integer> valueSchemaId = getSchemaId(message.value());
            // TODO uderzenie po schemę dla value? stamtąd pozyskuję informacje o typie
            MessageFormat messageFormat = MessageFormat.PROTOBUF;

            // TODO przekazać schemaRegistryClient
            MessageFormatter valueMessageFormatter = new ProtobufMessageFormatter(null);

            builder.deserializedValue(valueMessageFormatter.format(message.topic(), message.value().get()))
                    .valueFormat(valueMessageFormatter.getFormat())
                    .valueSchemaId(valueSchemaId.map(String::valueOf).orElse(null));
        }
        return builder.build();
    }

    /**
     * Schema identifier is fetched from value, because schema could have changed.
     * Latest schema may be too new for this record.
     * @param value
     * @return schema identifier
     */
    private Optional<Integer> getSchemaId(Bytes value) {
        ByteBuffer buffer = ByteBuffer.wrap(value.get());
        return buffer.get() == 0 ? Optional.of(buffer.getInt()) : Optional.empty();
    }
}
