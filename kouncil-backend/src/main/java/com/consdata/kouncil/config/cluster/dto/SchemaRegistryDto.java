package com.consdata.kouncil.config.cluster.dto;

import lombok.Data;

@Data
public class SchemaRegistryDto {

    private Long id;
    private String url;
    private SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfig;
}
