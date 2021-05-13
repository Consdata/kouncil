package com.consdata.kouncil;

public class KouncilRuntimeException extends RuntimeException {
    public KouncilRuntimeException(String message) {
        super(message);
    }

    public KouncilRuntimeException(Exception e) {
        super(e);
    }

    public KouncilRuntimeException(String message, Exception e) {
        super(message, e);
    }
}
