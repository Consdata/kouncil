package com.consdata.kouncil.serde.deserialization;

import com.consdata.kouncil.serde.MessageFormat;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeserializedData {
    String deserialized;
    String originalValue;
    MessageFormat messageFormat;
    Integer schemaId;
}
