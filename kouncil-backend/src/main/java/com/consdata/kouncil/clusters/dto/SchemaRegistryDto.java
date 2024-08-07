package com.consdata.kouncil.clusters.dto;

import lombok.Data;

@Data
public class SchemaRegistryDto {

    private Long id;
    private String url;
    private SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfig;
}
