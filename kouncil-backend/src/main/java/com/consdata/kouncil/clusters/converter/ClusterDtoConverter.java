package com.consdata.kouncil.clusters.converter;

import com.consdata.kouncil.clusters.dto.BrokerDto;
import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.clusters.dto.ClusterSecurityConfigDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistryDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;


@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ClusterDtoConverter {

    public static ClusterDto convertToClusterDto(Cluster cluster) {
        ClusterDto clusterDto = new ClusterDto();
        clusterDto.setId(cluster.getId());
        clusterDto.setName(cluster.getName());

        clusterDto.setGlobalJmxUser(cluster.getGlobalJmxUser());
        clusterDto.setGlobalJmxPassword(cluster.getGlobalJmxPassword());
        clusterDto.setGlobalJmxPort(cluster.getGlobalJmxPort());

        //brokers
        setClusterBrokers(cluster, clusterDto);
        //cluster security
        getClusterSecurityConfigDto(cluster, clusterDto);
        //schema registry
        setClusterSchemaRegistry(cluster, clusterDto);


        return clusterDto;
    }

    private static void setClusterBrokers(Cluster cluster, ClusterDto clusterDto) {
        cluster.getBrokers().forEach(broker -> {
            BrokerDto brokerDto = new BrokerDto();
            brokerDto.setId(broker.getId());
            brokerDto.setBootstrapServer(broker.getBootstrapServer());
            brokerDto.setJmxUser(broker.getJmxUser());
            brokerDto.setJmxPassword(broker.getJmxPassword());
            brokerDto.setJmxPort(broker.getJmxPort());
            clusterDto.getBrokers().add(brokerDto);
        });
    }

    private static void getClusterSecurityConfigDto(Cluster cluster, ClusterDto clusterDto) {
        ClusterSecurityConfigDto clusterSecurityConfigDto = new ClusterSecurityConfigDto();
        clusterSecurityConfigDto.setAuthenticationMethod(cluster.getClusterSecurityConfig().getAuthenticationMethod());
        clusterSecurityConfigDto.setSecurityProtocol(cluster.getClusterSecurityConfig().getSecurityProtocol());
        clusterSecurityConfigDto.setSaslMechanism(cluster.getClusterSecurityConfig().getSaslMechanism());
        clusterSecurityConfigDto.setTruststoreLocation(cluster.getClusterSecurityConfig().getTruststoreLocation());
        clusterSecurityConfigDto.setTruststorePassword(cluster.getClusterSecurityConfig().getTruststorePassword());
        clusterSecurityConfigDto.setKeystoreLocation(cluster.getClusterSecurityConfig().getKeystoreLocation());
        clusterSecurityConfigDto.setKeystorePassword(cluster.getClusterSecurityConfig().getKeystorePassword());
        clusterSecurityConfigDto.setKeyPassword(cluster.getClusterSecurityConfig().getKeyPassword());

        clusterSecurityConfigDto.setUsername(cluster.getClusterSecurityConfig().getUsername());
        clusterSecurityConfigDto.setPassword(cluster.getClusterSecurityConfig().getPassword());
        clusterSecurityConfigDto.setAwsProfileName(cluster.getClusterSecurityConfig().getAwsProfileName());
        clusterDto.setClusterSecurityConfig(clusterSecurityConfigDto);
    }

    private static void setClusterSchemaRegistry(Cluster cluster, ClusterDto clusterDto) {
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
    }

    private static SchemaRegistrySecurityConfigDto getSchemaRegistrySecurityConfigDto(SchemaRegistry schemaRegistry) {
        SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfigDto = new SchemaRegistrySecurityConfigDto();

        schemaRegistrySecurityConfigDto.setAuthenticationMethod(schemaRegistry.getSchemaRegistrySecurityConfig().getAuthenticationMethod());
        schemaRegistrySecurityConfigDto.setSecurityProtocol(schemaRegistry.getSchemaRegistrySecurityConfig().getSecurityProtocol());

        schemaRegistrySecurityConfigDto.setTruststoreLocation(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststoreLocation());
        schemaRegistrySecurityConfigDto.setTruststorePassword(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststorePassword());
        schemaRegistrySecurityConfigDto.setTruststoreType(schemaRegistry.getSchemaRegistrySecurityConfig().getTruststoreType());

        schemaRegistrySecurityConfigDto.setKeystoreType(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystoreType());
        schemaRegistrySecurityConfigDto.setKeystoreLocation(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystoreLocation());
        schemaRegistrySecurityConfigDto.setKeystorePassword(schemaRegistry.getSchemaRegistrySecurityConfig().getKeystorePassword());
        schemaRegistrySecurityConfigDto.setKeyPassword(schemaRegistry.getSchemaRegistrySecurityConfig().getKeyPassword());

        schemaRegistrySecurityConfigDto.setUsername(schemaRegistry.getSchemaRegistrySecurityConfig().getUsername());
        schemaRegistrySecurityConfigDto.setPassword(schemaRegistry.getSchemaRegistrySecurityConfig().getPassword());
        return schemaRegistrySecurityConfigDto;
    }

}
