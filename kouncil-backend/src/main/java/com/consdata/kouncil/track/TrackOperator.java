package com.consdata.kouncil.track;

public enum TrackOperator {
    LIKE("0"),
    NOT_LIKE("1"),
    IS("2"),
    NOT_IS("3");

    private String frontendIndex;

    TrackOperator(String frontendIndex) {
        this.frontendIndex = frontendIndex;
    }
}
