package com.consdata.kouncil.datamasking;

public class DataMaskingExcpetion extends RuntimeException {

    public DataMaskingExcpetion(Exception e) {
        super(e);
    }
}
