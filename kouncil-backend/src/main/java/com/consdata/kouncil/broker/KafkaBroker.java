package com.consdata.kouncil.broker;

import lombok.Builder;
import lombok.Data;

import java.util.Comparator;

@Data
@Builder
public class KafkaBroker implements Comparable<KafkaBroker> {

    private String host;

    private int port;

    private String id;

    private String rack;

    private boolean jmxStats;

    private String system;

    private Integer availableProcessors;

    private Double systemLoadAverage;

    private Long freeMem;

    private Long totalMem;

    @Override
    public int compareTo(KafkaBroker o) {
        return Comparator
                .comparing(KafkaBroker::getHost)
                .thenComparing(KafkaBroker::getPort)
                .thenComparing(KafkaBroker::getId)
                .compare(this, o);
    }
}
