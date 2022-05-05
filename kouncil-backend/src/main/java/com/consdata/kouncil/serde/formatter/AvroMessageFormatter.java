package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class AvroMessageFormatter implements MessageFormatter {

    @Override
    public String deserialize(String topic, byte[] value) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public Bytes serialize(String topic, String value, ParsedSchema parsedSchema) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.AVRO;
    }
}
