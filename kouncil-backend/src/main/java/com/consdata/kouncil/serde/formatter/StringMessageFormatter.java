package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

import java.nio.charset.StandardCharsets;

public class StringMessageFormatter implements MessageFormatter {
    @Override
    public String format(String topic, byte[] value) {
        return new String(value, StandardCharsets.UTF_8);
    }

    @Override
    public Bytes read(String topic, String value, ParsedSchema parsedSchema) {
        return Bytes.wrap(value.getBytes());
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.STRING;
    }
}
