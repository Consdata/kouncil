package com.consdata.kouncil.schema.clusteraware;

import com.consdata.kouncil.schema.registry.SchemaRegistryFacade;
import com.consdata.kouncil.serde.MessageFormat;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import lombok.Builder;
import lombok.Value;

import java.util.EnumMap;

@Value
@Builder
public class ClusterAwareSchema {
    SchemaRegistryFacade schemaRegistryFacade;
    EnumMap<MessageFormat, MessageFormatter> formatters;

    public MessageFormat getSchemaFormat(String topic, Integer schemaId, boolean isKey) {
        return schemaRegistryFacade.getSchemaFormat(topic, schemaId, isKey);
    }

    public MessageFormatter getFormatter(MessageFormat messageFormat) {
        return formatters.get(messageFormat);
    }
}
