package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import org.apache.kafka.common.utils.Bytes;

import java.nio.charset.StandardCharsets;

public class StringMessageFormatter implements MessageFormatter {
    @Override
    public String deserialize(DeserializationData deserializationData) {
        return new String(deserializationData.getValue(), StandardCharsets.UTF_8);
    }

    @Override
    public Bytes serialize(SerializationData serializationData) {
        return Bytes.wrap(serializationData.getValue().getBytes());
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.STRING;
    }
}
