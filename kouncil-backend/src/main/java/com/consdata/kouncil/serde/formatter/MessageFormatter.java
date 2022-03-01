package com.consdata.kouncil.serde.formatter;

import com.consdata.kouncil.serde.MessageFormat;

public interface MessageFormatter {
    String format(String topic, byte[] value);
    MessageFormat getFormat();
}
