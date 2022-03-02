package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.MessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.utils.Bytes;

import java.nio.ByteBuffer;
import java.util.Optional;

public class SchemaMessageSerde {
    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message,
                                         MessageFormatter keyFormatter,
                                         MessageFormatter valueFormatter) {
        var builder = DeserializedValue.builder();
        if (message.key() != null) {
            Optional<Integer> keySchemaId = getSchemaId(message.key());
            builder.deserializedKey(keyFormatter.format(message.topic(), message.key().get()))
                    .keyFormat(keyFormatter.getFormat())
                    .keySchemaId(keySchemaId.map(String::valueOf).orElse(null));
        }
        if (message.value() != null) {
            Optional<Integer> valueSchemaId = getSchemaId(message.value());
            builder.deserializedValue(valueFormatter.format(message.topic(), message.value().get()))
                    .valueFormat(valueFormatter.getFormat())
                    .valueSchemaId(valueSchemaId.map(String::valueOf).orElse(null));
        }
        return builder.build();
    }

    /**
     * Schema identifier is fetched from message, because schema could have changed.
     * Latest schema may be too new for this record.
     * @param message
     * @return schema identifier
     */
    private Optional<Integer> getSchemaId(Bytes message) {
        ByteBuffer buffer = ByteBuffer.wrap(message.get());
        return buffer.get() == 0 ? Optional.of(buffer.getInt()) : Optional.empty();
    }
}
