package com.consdata.kouncil.schemaregistry;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchemasDTO {
    private String keyPlainTextSchema;
    private String valuePlainTextSchema;
}
