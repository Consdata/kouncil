package com.consdata.kouncil.config.cluster.converter;

import com.consdata.kouncil.config.cluster.dto.BrokerDto;
import com.consdata.kouncil.config.cluster.dto.ClusterDto;
import com.consdata.kouncil.config.cluster.dto.ClusterSecurityConfigDto;
import com.consdata.kouncil.config.cluster.dto.SchemaRegistryDto;
import com.consdata.kouncil.config.cluster.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;


@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ClusterConverter {

    public static ClusterDto convertToClusterDto(Cluster cluster) {
        ClusterDto clusterDto = new ClusterDto();
        clusterDto.setId(cluster.getId());
        clusterDto.setName(cluster.getName());

        //brokers
        cluster.getBrokers().forEach(broker -> {
            BrokerDto brokerDto = new BrokerDto();
            brokerDto.setBootstrapServer(broker.getBootstrapServer());
            brokerDto.setJmxUser(broker.getJmxUser());
            brokerDto.setJmxPassword(broker.getJmxPassword());
            brokerDto.setJmxPort(broker.getJmxPort());
            clusterDto.getBrokers().add(brokerDto);
        });

        if (cluster.getClusterSecurityConfig() != null) {
            clusterDto.setClusterSecurityConfig(getClusterSecurityConfigDto(cluster));
        }

        SchemaRegistry schemaRegistry = cluster.getSchemaRegistry();
        if (schemaRegistry != null) {
            SchemaRegistryDto schemaRegistryDto = new SchemaRegistryDto();
            schemaRegistryDto.setId(schemaRegistry.getId());
            schemaRegistryDto.setUrl(schemaRegistry.getUrl());

            if (schemaRegistry.getSchemaRegistrySecurityConfig() != null) {
                schemaRegistryDto.setSchemaRegistrySecurityConfig(getSchemaRegistrySecurityConfigDto(schemaRegistry));
            }

            clusterDto.setSchemaRegistry(schemaRegistryDto);
        }

        return clusterDto;
    }

    private static SchemaRegistrySecurityConfigDto getSchemaRegistrySecurityConfigDto(SchemaRegistry schemaRegistry) {
        SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfigDto = new SchemaRegistrySecurityConfigDto();

        schemaRegistrySecurityConfigDto.setSecurityProtocol(schemaRegistry.getSchemaRegistrySecurityConfig().getSecurityProtocol());

        schemaRegistrySecurityConfigDto.setTruststoreType(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststoreType());
        schemaRegistrySecurityConfigDto.setTruststoreLocation(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststoreLocation());
        schemaRegistrySecurityConfigDto.setTruststorePassword(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststorePassword());

        schemaRegistrySecurityConfigDto.setKeystoreType(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystoreType());
        schemaRegistrySecurityConfigDto.setKeystoreLocation(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystoreLocation());
        schemaRegistrySecurityConfigDto.setKeystorePassword(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystorePassword());
        schemaRegistrySecurityConfigDto.setKeyPassword(schemaRegistry.getSchemaRegistrySecurityConfig().getKeyPassword());

        schemaRegistrySecurityConfigDto.setUsername(schemaRegistry.getSchemaRegistrySecurityConfig().getUsername());
        schemaRegistrySecurityConfigDto.setPassword(schemaRegistry.getSchemaRegistrySecurityConfig().getPassword());
        return schemaRegistrySecurityConfigDto;
    }

    private static ClusterSecurityConfigDto getClusterSecurityConfigDto(Cluster cluster) {
        ClusterSecurityConfigDto clusterSecurityConfigDto = new ClusterSecurityConfigDto();
        clusterSecurityConfigDto.setSecurityProtocol(cluster.getClusterSecurityConfig().getSecurityProtocol());
        clusterSecurityConfigDto.setSaslMechanism(cluster.getClusterSecurityConfig().getSaslMechanism());
        clusterSecurityConfigDto.setSaslJassConfig(cluster.getClusterSecurityConfig().getSaslJassConfig());
        clusterSecurityConfigDto.setSaslCallbackHandler(cluster.getClusterSecurityConfig().getSaslCallbackHandler());
        clusterSecurityConfigDto.setTruststoreLocation(cluster.getClusterSecurityConfig().getTruststoreLocation());
        clusterSecurityConfigDto.setTruststorePassword(cluster.getClusterSecurityConfig().getTruststorePassword());
        clusterSecurityConfigDto.setKeystoreLocation(cluster.getClusterSecurityConfig().getKeystoreLocation());
        clusterSecurityConfigDto.setKeystorePassword(cluster.getClusterSecurityConfig().getKeystorePassword());
        clusterSecurityConfigDto.setKeyPassword(cluster.getClusterSecurityConfig().getKeyPassword());
        return clusterSecurityConfigDto;
    }
}
