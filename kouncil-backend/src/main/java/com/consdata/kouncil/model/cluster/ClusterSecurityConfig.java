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

    @Column(name = "SECURITY_PROTOCOL")
    @Enumerated(EnumType.STRING)
    private ClusterSecurityProtocol securityProtocol;

    @Column(name = "SASL_MECHANISM")
    @Enumerated(EnumType.STRING)
    private ClusterSASLMechanism saslMechanism;

    @Column(name = "SASL_JASS_CONFIG")
    private String saslJassConfig;

    @Column(name = "SASL_CALLBACK_HANDLER")
    private String saslCallbackHandler;

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
}
