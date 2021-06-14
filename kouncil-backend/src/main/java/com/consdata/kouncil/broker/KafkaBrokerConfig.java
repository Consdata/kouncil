package com.consdata.kouncil.broker;

import lombok.Builder;
import lombok.Data;
import org.apache.kafka.clients.admin.ConfigEntry;

import java.util.Comparator;

@Data
@Builder
public class KafkaBrokerConfig implements Comparable<KafkaBrokerConfig> {
    private final String name;
    private final String value;
    private final ConfigEntry.ConfigSource source;
    private final boolean isSensitive;
    private final boolean isReadOnly;

    @Override
    public int compareTo(KafkaBrokerConfig o) {
        return Comparator
                .comparing(KafkaBrokerConfig::getName)
                .thenComparing(KafkaBrokerConfig::getSource)
                .compare(this, o);
    }
}
