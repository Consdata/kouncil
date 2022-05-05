package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

public interface MessageFormatter {
    String deserialize(String topic, byte[] value);
    Bytes serialize(String topic, String value, ParsedSchema parsedSchema);
    MessageFormat getFormat();
}
