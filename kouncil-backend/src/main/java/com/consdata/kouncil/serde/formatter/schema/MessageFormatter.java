package com.consdata.kouncil.serde.formatter.schema;

import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.deserialization.DeserializationData;
import com.consdata.kouncil.serde.serialization.SerializationData;
import org.apache.kafka.common.utils.Bytes;

public interface MessageFormatter {
    String deserialize(DeserializationData deserializationData);
    Bytes serialize(SerializationData serializationData);
    MessageFormat getFormat();
}
