package com.consdata.kouncil.serde;

import com.consdata.kouncil.schemaregistry.SchemaRegistryService;
import com.consdata.kouncil.serde.formatter.MessageFormatter;
import lombok.Builder;
import lombok.Value;

import java.util.EnumMap;

@Value
@Builder
public class ClusterAwareSchema {
    SchemaRegistryService schemaRegistryService;
    EnumMap<MessageFormat, MessageFormatter> formatters;
}
