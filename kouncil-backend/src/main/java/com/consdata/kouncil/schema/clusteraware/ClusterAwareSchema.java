package com.consdata.kouncil.schema.clusteraware;

import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import lombok.Builder;
import lombok.Getter;

import java.util.EnumMap;

@Builder
public class ClusterAwareSchema {
    @Getter
    SchemaRegistryFacade schemaRegistryFacade;
    EnumMap<MessageFormat, MessageFormatter> formatters;

    public MessageFormatter getFormatter(MessageFormat messageFormat) {
        return formatters.get(messageFormat);
    }
}
