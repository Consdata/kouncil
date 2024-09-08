package com.consdata.kouncil.config.cluster.dto;

import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import lombok.Data;

@Data
public class ClusterSecurityConfigDto {

    private ClusterAuthenticationMethod authenticationMethod;
    private ClusterSecurityProtocol securityProtocol;
    private ClusterSASLMechanism saslMechanism;
    private String truststoreLocation;
    private String truststorePassword;
    private String keystoreLocation;
    private String keystorePassword;
    private String keyPassword;
    private String username;
    private String password;
    private String awsProfileName;
}
