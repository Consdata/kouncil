package com.consdata.kouncil.serde.deserialization;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeserializationData {
    String topicName;
    byte[] value;
}
