package com.consdata.kouncil.clusters.dto;

import com.consdata.kouncil.model.schemaregistry.SchemaSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.StoreType;
import lombok.Data;

@Data
public class SchemaRegistrySecurityConfigDto {

    private SchemaSecurityProtocol securityProtocol;
    private StoreType truststoreType;
    private String truststoreLocation;
    private String truststorePassword;
    private StoreType keystoreType;
    private String keystoreLocation;
    private String keystorePassword;
    private String keyPassword;
    private String username;
    private String password;
}
