package com.consdata.kouncil.serde.deserialization;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DeserializedValue {
    NewDeserializedData keyData;
    NewDeserializedData valueData;
}
