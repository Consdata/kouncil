package com.consdata.kouncil.broker;

import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;

import java.util.Comparator;

@Data
@Builder
public class BrokerConfig implements Comparable<BrokerConfig> {
    private final String name;
    private final String value;
    private final ConfigEntry.ConfigSource source;
    private final boolean isSensitive;
    private final boolean isReadOnly;

    @Override
    public int compareTo(BrokerConfig o) {
        return Comparator
                .comparing(BrokerConfig::getName)
                .thenComparing(BrokerConfig::getSource)
                .compare(this, o);
    }
}
