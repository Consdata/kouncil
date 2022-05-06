package com.consdata.kouncil.serde;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class KouncilSchemaMetadata {
    String schemaTopic;
    Integer schemaId;
    boolean isKey;
}
