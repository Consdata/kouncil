package com.consdata.kouncil.schema;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchemasConfigurationDTO {
    private String serverId;
    private boolean hasSchemaRegistry;
}
