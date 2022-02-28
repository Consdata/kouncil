package com.consdata.kouncil.serde.formatter;

import java.nio.charset.StandardCharsets;

public class SchemalessMessageFormatter implements MessageFormatter {
    @Override
    public String format(String topic, byte[] value) {
        return new String(value, StandardCharsets.UTF_8);
    }
}
