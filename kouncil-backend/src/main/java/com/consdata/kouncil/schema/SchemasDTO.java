package com.consdata.kouncil.schema;

import com.consdata.kouncil.serde.MessageFormat;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SchemasDTO {
    private MessageFormat keyMessageFormat;
    private String keyPlainTextSchema;
    private MessageFormat valueMessageFormat;
    private String valuePlainTextSchema;
}
