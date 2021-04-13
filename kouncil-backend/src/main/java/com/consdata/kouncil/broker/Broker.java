package com.consdata.kouncil.broker;

import lombok.Builder;
import lombok.Data;

import java.util.Comparator;

@Data
@Builder
public class Broker implements Comparable<Broker> {
    private String host;
    private int port;
    private String id;
    private String rack;

    @Override
    public int compareTo(Broker o) {
        return Comparator
                .comparing(Broker::getHost)
                .thenComparing(Broker::getPort)
                .thenComparing(Broker::getId)
                .compare(this, o);
    }
}
