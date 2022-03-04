package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JsonSchemaMessageFormatter implements MessageFormatter {

    @Override
    public String format(String topic, byte[] value) {
        log.info("NOT IMPLEMENTED");
        return null;
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.JSON_SCHEMA;
    }
}
