package com.consdata.kouncil.model.cluster;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClusterSASLMechanism {

    PLAIN("PLAIN"),
    AWS_MSK_IAM("AWS_MSK_IAM"),
    SCRAM_SHA_256("SCRAM-SHA-256"),
    SCRAM_SHA_512("SCRAM-SHA-512");

    private final String mechanismName;
}
