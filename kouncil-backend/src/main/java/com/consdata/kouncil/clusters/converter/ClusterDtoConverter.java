package com.consdata.kouncil.clusters.converter;

import com.consdata.kouncil.clusters.dto.BrokerDto;
import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.clusters.dto.ClusterSecurityConfigDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistryDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistrySecurityConfig;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;


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
        setClusterSecurityConfigDto(cluster, clusterDto);
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

    private static void setClusterSecurityConfigDto(Cluster cluster, ClusterDto clusterDto) {
        ClusterSecurityConfigDto clusterSecurityConfigDto = new ClusterSecurityConfigDto();
        BeanUtils.copyProperties(cluster.getClusterSecurityConfig(), clusterSecurityConfigDto);
        clusterDto.setClusterSecurityConfig(clusterSecurityConfigDto);
    }

    private static void setClusterSchemaRegistry(Cluster cluster, ClusterDto clusterDto) {
        SchemaRegistry schemaRegistry = cluster.getSchemaRegistry();
        if (schemaRegistry != null) {
            SchemaRegistryDto schemaRegistryDto = new SchemaRegistryDto();
            schemaRegistryDto.setId(schemaRegistry.getId());
            schemaRegistryDto.setUrl(schemaRegistry.getUrl());

            if (schemaRegistry.getSchemaRegistrySecurityConfig() != null) {
                setSchemaRegistrySecurityConfigDto(schemaRegistry.getSchemaRegistrySecurityConfig(), schemaRegistryDto);
            }

            clusterDto.setSchemaRegistry(schemaRegistryDto);
        }
    }

    private static void setSchemaRegistrySecurityConfigDto(SchemaRegistrySecurityConfig schemaRegistrySecurityConfig, SchemaRegistryDto schemaRegistryDto) {
        SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfigDto = new SchemaRegistrySecurityConfigDto();
        BeanUtils.copyProperties(schemaRegistrySecurityConfig, schemaRegistrySecurityConfigDto);
        schemaRegistryDto.setSchemaRegistrySecurityConfig(schemaRegistrySecurityConfigDto);
    }

}
