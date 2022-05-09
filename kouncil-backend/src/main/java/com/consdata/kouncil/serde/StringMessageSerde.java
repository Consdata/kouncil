package com.consdata.kouncil.serde;

import com.consdata.kouncil.serde.formatter.StringMessageFormatter;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.stereotype.Service;

@Service
public class StringMessageSerde {
    private final StringMessageFormatter stringMessageFormatter;
    public StringMessageSerde() {
        this.stringMessageFormatter = new StringMessageFormatter();
    }

    public String deserialize(Bytes value) {
        return stringMessageFormatter.deserialize(value.get());
    }

    public Bytes serialize(String value) {
        return stringMessageFormatter.serialize(value);
    }
}
