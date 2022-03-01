package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;

import java.nio.charset.StandardCharsets;

public class StringMessageFormatter implements MessageFormatter {
    @Override
    public String format(String topic, byte[] value) {
        return new String(value, StandardCharsets.UTF_8);
    }

    @Override
    public MessageFormat getFormat() {
        return MessageFormat.STRING;
    }
}
