package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import com.consdata.kouncil.serde.serialization.SerializationData;
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
            String deserializedKey = stringMessageFormatter.deserialize(DeserializationData.builder()
                    .topicName(message.topic())
                    .value(message.key().get())
                    .build());
            builder.deserializedKey(deserializedKey).keyFormat(stringMessageFormatter.getFormat());
        }
        if (message.value() != null) {
            String deserializedValue = stringMessageFormatter.deserialize(DeserializationData.builder()
                    .topicName(message.topic())
                    .value(message.value().get())
                    .build());
            builder.deserializedValue(deserializedValue).valueFormat(stringMessageFormatter.getFormat());
        }
        return builder.build();
    }

    public ProducerRecord<Bytes, Bytes> serialize(String topicName, String key, String value) {
        return new ProducerRecord<>(topicName,
                stringMessageFormatter.serialize(SerializationData.builder().topicName(topicName).value(key).build()),
                stringMessageFormatter.serialize(SerializationData.builder().topicName(topicName).value(value).build()));
    }
}
