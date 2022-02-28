package com.consdata.kouncil.serde.deserialization;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import com.consdata.kouncil.serde.formatter.ProtobufMessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.nio.ByteBuffer;
import java.util.Optional;

public class MessageDeserializer {

    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message) {
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
