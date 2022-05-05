package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import org.apache.kafka.common.utils.Bytes;

public interface MessageFormatter {
    String format(String topic, byte[] value);
    Bytes read(String topic, String value, ParsedSchema parsedSchema);
    MessageFormat getFormat();
}
