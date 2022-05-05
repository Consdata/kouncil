package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.utils.Bytes;

public class StringMessageSerde {
    private final StringMessageFormatter stringMessageFormatter;
    public StringMessageSerde(StringMessageFormatter stringMessageFormatter) {
        this.stringMessageFormatter = stringMessageFormatter;
    }
    public DeserializedValue deserialize(ConsumerRecord<Bytes, Bytes> message) {
        var builder = DeserializedValue.builder();
        if (message.key() != null) {
            builder.deserializedKey(stringMessageFormatter.deserialize(message.topic(), message.key().get()))
                    .keyFormat(stringMessageFormatter.getFormat());
        }
        if (message.value() != null) {
            builder.deserializedValue(stringMessageFormatter.deserialize(message.topic(), message.value().get()))
                    .valueFormat(stringMessageFormatter.getFormat());
        }
        return builder.build();
    }

    public ProducerRecord<Bytes, Bytes> serialize(String topicName, String key, String value) {
        return new ProducerRecord<>(topicName, Bytes.wrap(key.getBytes()), Bytes.wrap(value.getBytes()));
    }
}
