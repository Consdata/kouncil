package com.consdata.kouncil.model.schemaregistry;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Embeddable
@Data
@EqualsAndHashCode
public class SchemaRegistrySecurityConfig {

    @Column(name = "AUTHENTICATION_METHOD", nullable = false)
    @Enumerated(EnumType.STRING)
    private SchemaAuthenticationMethod authenticationMethod;

    @Column(name = "SECURITY_PROTOCOL")
    @Enumerated(EnumType.STRING)
    private SchemaSecurityProtocol securityProtocol;

    @Column(name = "TRUSTSTORE_LOCATION")
    private String truststoreLocation;

    @Column(name = "TRUSTSTORE_PASSWORD")
    private String truststorePassword;

    @Column(name = "TRUSTSTORE_TYPE")
    private StoreType truststoreType;

    @Column(name = "KEYSTORE_LOCATION")
    private String keystoreLocation;

    @Column(name = "KEYSTORE_PASSWORD")
    private String keystorePassword;

    @Column(name = "KEYSTORE_TYPE")
    private StoreType keystoreType;

    @Column(name = "KEY_PASSWORD")
    private String keyPassword;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "PASSWORD")
    private String password;
}
