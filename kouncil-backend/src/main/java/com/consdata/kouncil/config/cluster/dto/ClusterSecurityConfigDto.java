package com.consdata.kouncil.config.cluster.dto;

import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import lombok.Data;

@Data
public class ClusterSecurityConfigDto {

    private ClusterSecurityProtocol securityProtocol;
    private ClusterSASLMechanism saslMechanism;
    private String saslJassConfig;
    private String saslCallbackHandler;
    private String truststoreLocation;
    private String truststorePassword;
    private String keystoreLocation;
    private String keystorePassword;
    private String keyPassword;
}
