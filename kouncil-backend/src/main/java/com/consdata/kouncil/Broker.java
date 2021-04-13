package com.consdata.kouncil;

import java.util.Comparator;

import lombok.Builder;
import lombok.Data;

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
