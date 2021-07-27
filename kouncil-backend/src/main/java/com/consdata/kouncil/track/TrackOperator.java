package com.consdata.kouncil.track;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum TrackOperator {
    LIKE("0"),
    NOT_LIKE("1"),
    IS("2"),
    NOT_IS("3"),
    REGEX("4");

    private static final Map<String, TrackOperator> MAP_VALUES = Stream.of(values())
            .collect(Collectors.toMap(TrackOperator::getFrontendIndex, Function.identity()));
    private final String frontendIndex;

    TrackOperator(String frontendIndex) {
        this.frontendIndex = frontendIndex;
    }

    public static TrackOperator fromValue(String value) {
        if (value == null) {
            return null;
        }
        return MAP_VALUES.get(value);
    }

    public String getFrontendIndex() {
        return frontendIndex;
    }
}
