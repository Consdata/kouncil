package com.consdata.kouncil.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.core.io.Resource;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchemaRegistryConfig {

    private String url;
    private SchemaRegistrySecurity security;
    private SchemaRegistrySSL ssl;
    private SchemaRegistryAuth auth;

    @Getter
    @Setter
    public static class SchemaRegistrySecurity {

        private String protocol;
    }

    @Getter
    @Setter
    public static class SchemaRegistrySSL {

        private String keyPassword;
        private String keyStoreCertificateChain;
        private String keyStoreKey;
        private Resource keyStoreLocation;
        private String keyStorePassword;
        private String keyStoreType;
        private String trustStoreCertificates;
        private Resource trustStoreLocation;
        private String trustStorePassword;
        private String trustStoreType;
        private String protocol;
    }

    @Getter
    @Setter
    public static class SchemaRegistryAuth {

        private String source;
        private String userInfo;
    }
}
