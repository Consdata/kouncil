package com.consdata.kouncil.serde.deserialization;

import com.consdata.kouncil.serde.MessageFormat;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeserializedValue {
    String deserializedKey;
    String deserializedValue;
    MessageFormat keyFormat;
    MessageFormat valueFormat;
    String keySchemaId;
    String valueSchemaId;
}
