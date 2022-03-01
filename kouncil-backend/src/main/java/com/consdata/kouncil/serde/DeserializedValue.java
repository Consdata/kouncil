package com.consdata.kouncil.serde;

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
