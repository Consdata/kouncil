package com.consdata.kouncil.serde.formatter;

import org.apache.kafka.common.utils.Bytes;

import java.nio.charset.StandardCharsets;

public class StringMessageFormatter {
    public String deserialize(byte[] value) {
        return new String(value, StandardCharsets.UTF_8);
    }

    public Bytes serialize(String value) {
        return Bytes.wrap(value.getBytes());
    }
}
