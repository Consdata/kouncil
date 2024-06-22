package com.consdata.kouncil.config.cluster.dto;

import java.util.HashSet;
import java.util.Set;
import lombok.Data;

@Data
public class ClusterDto {

    private Long id;
    private String name;
    private Set<BrokerDto> brokers = new HashSet<>();
    private ClusterSecurityConfigDto clusterSecurityConfig;
    private SchemaRegistryDto schemaRegistry;
}
