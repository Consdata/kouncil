package com.consdata.kouncil.serde.serialization;

import io.confluent.kafka.schemaregistry.ParsedSchema;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SerializationData {
    String topicName;
    String value;
    ParsedSchema schema;
}
