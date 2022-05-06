package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import io.confluent.kafka.schemaregistry.ParsedSchema;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.utils.Bytes;

@Slf4j
public class AvroMessageFormatter implements MessageFormatter {

    @Override
    public String deserialize(DeserializationData deserializationData) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public Bytes serialize(SerializationData serializationData) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.AVRO;
    }
}
