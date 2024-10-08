package com.consdata.kouncil.model.cluster;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Embeddable
@Data
@EqualsAndHashCode
public class ClusterSecurityConfig {

    @Column(name = "AUTHENTICATION_METHOD", nullable = false)
    @Enumerated(EnumType.STRING)
    private ClusterAuthenticationMethod authenticationMethod;

    @Column(name = "SECURITY_PROTOCOL")
    @Enumerated(EnumType.STRING)
    private ClusterSecurityProtocol securityProtocol;

    @Column(name = "SASL_MECHANISM")
    @Enumerated(EnumType.STRING)
    private ClusterSASLMechanism saslMechanism;

    @Column(name = "TRUSTSTORE_LOCATION")
    private String truststoreLocation;

    @Column(name = "TRUSTSTORE_PASSWORD")
    private String truststorePassword;

    @Column(name = "KEYSTORE_LOCATION")
    private String keystoreLocation;

    @Column(name = "KEYSTORE_PASSWORD")
    private String keystorePassword;

    @Column(name = "KEY_PASSWORD")
    private String keyPassword;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "AWS_PROFILE_NAME")
    private String awsProfileName;
}
