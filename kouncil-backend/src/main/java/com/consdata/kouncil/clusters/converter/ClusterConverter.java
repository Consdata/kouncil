package com.consdata.kouncil.clusters.converter;

import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.clusters.dto.ClusterSecurityConfigDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistryDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityConfig;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.SchemaAuthenticationMethod;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistrySecurityConfig;
import com.consdata.kouncil.model.schemaregistry.SchemaSecurityProtocol;
import java.util.HashSet;
import java.util.List;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistrySecurityConfig;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.beans.BeanUtils;


@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ClusterConverter {

    public static Cluster convertToCluster(ClusterDto clusterDto) {
        Cluster cluster = new Cluster();
        cluster.setId(clusterDto.getId());
        cluster.setName(clusterDto.getName());

        cluster.setGlobalJmxUser(clusterDto.getGlobalJmxUser());
        cluster.setGlobalJmxPassword(clusterDto.getGlobalJmxPassword());
        cluster.setGlobalJmxPort(clusterDto.getGlobalJmxPort());

        //brokers
        processBrokers(cluster, clusterDto);
        //cluster security
        processSecurity(cluster, clusterDto);
        //process schema registry
        processSchemaRegistry(cluster, clusterDto);

        return cluster;
    }

    private static void processSchemaRegistry(Cluster cluster, ClusterDto clusterDto) {
        SchemaRegistryDto schemaRegistryDto = clusterDto.getSchemaRegistry();
        if (schemaRegistryDto != null && StringUtils.hasText(schemaRegistryDto.getUrl())) {
            SchemaRegistry schemaRegistry = new SchemaRegistry();
            schemaRegistry.setId(schemaRegistryDto.getId());
            schemaRegistry.setUrl(schemaRegistryDto.getUrl());
            schemaRegistry.setSchemaRegistrySecurityConfig(new SchemaRegistrySecurityConfig());
            schemaRegistry.getSchemaRegistrySecurityConfig().setAuthenticationMethod(SchemaAuthenticationMethod.NONE);

            SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfigDto = schemaRegistryDto.getSchemaRegistrySecurityConfig();
            if (schemaRegistrySecurityConfigDto != null && !SchemaAuthenticationMethod.NONE.equals(schemaRegistrySecurityConfigDto.getAuthenticationMethod())) {
                schemaRegistry.getSchemaRegistrySecurityConfig().setAuthenticationMethod(SchemaAuthenticationMethod.SSL);

                if (SchemaAuthenticationMethod.SSL_BASIC_AUTH.equals(schemaRegistrySecurityConfigDto.getAuthenticationMethod())) {
                    schemaRegistry.getSchemaRegistrySecurityConfig().setAuthenticationMethod(SchemaAuthenticationMethod.SSL_BASIC_AUTH);
                    schemaRegistry.getSchemaRegistrySecurityConfig().setUsername(schemaRegistrySecurityConfigDto.getUsername());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setPassword(schemaRegistrySecurityConfigDto.getPassword());
                }

                if (List.of(SchemaAuthenticationMethod.SSL, SchemaAuthenticationMethod.SSL_BASIC_AUTH)
                        .contains(schemaRegistrySecurityConfigDto.getAuthenticationMethod())) {
                    schemaRegistry.getSchemaRegistrySecurityConfig().setSecurityProtocol(SchemaSecurityProtocol.SSL);
                    schemaRegistry.getSchemaRegistrySecurityConfig().setKeystoreLocation(schemaRegistrySecurityConfigDto.getKeystoreLocation());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setKeystorePassword(schemaRegistrySecurityConfigDto.getKeystorePassword());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setKeystoreType(schemaRegistrySecurityConfigDto.getKeystoreType());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setKeyPassword(schemaRegistrySecurityConfigDto.getKeyPassword());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setTruststoreLocation(schemaRegistrySecurityConfigDto.getTruststoreLocation());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setTruststorePassword(schemaRegistrySecurityConfigDto.getTruststorePassword());
                    schemaRegistry.getSchemaRegistrySecurityConfig().setTruststoreType(schemaRegistrySecurityConfigDto.getTruststoreType());
                }
            }

            cluster.setSchemaRegistry(schemaRegistry);
        }

    }

    private static void processBrokers(Cluster cluster, ClusterDto clusterDto) {
        cluster.setBrokers(new HashSet<>());
        clusterDto.getBrokers().forEach(brokerDto -> {
            Broker broker = new Broker();
            broker.setId(brokerDto.getId());
            broker.setBootstrapServer(brokerDto.getBootstrapServer());
            broker.setJmxUser(brokerDto.getJmxUser());
            broker.setJmxPassword(brokerDto.getJmxPassword());
            broker.setJmxPort(brokerDto.getJmxPort());
            cluster.getBrokers().add(broker);
        });
    }

    private static void processSecurity(Cluster cluster, ClusterDto clusterDto) {
        ClusterSecurityConfigDto dtoSecurityConfig = clusterDto.getClusterSecurityConfig();
        if (dtoSecurityConfig != null) {
            ClusterSecurityConfig clusterSecurityConfig = new ClusterSecurityConfig();
            clusterSecurityConfig.setAuthenticationMethod(dtoSecurityConfig.getAuthenticationMethod());
            switch (dtoSecurityConfig.getAuthenticationMethod()) {
                case SASL:
                    clusterSecurityConfig.setSecurityProtocol(dtoSecurityConfig.getSecurityProtocol());
                    clusterSecurityConfig.setSaslMechanism(dtoSecurityConfig.getSaslMechanism());
                    clusterSecurityConfig.setUsername(dtoSecurityConfig.getUsername());
                    clusterSecurityConfig.setPassword(dtoSecurityConfig.getPassword());
                    clusterSecurityConfig.setKeystoreLocation(dtoSecurityConfig.getKeystoreLocation());
                    clusterSecurityConfig.setKeystorePassword(dtoSecurityConfig.getKeystorePassword());
                    clusterSecurityConfig.setKeyPassword(dtoSecurityConfig.getKeyPassword());
                    clusterSecurityConfig.setTruststoreLocation(dtoSecurityConfig.getTruststoreLocation());
                    clusterSecurityConfig.setTruststorePassword(dtoSecurityConfig.getTruststorePassword());
                    break;
                case SSL:
                    clusterSecurityConfig.setSecurityProtocol(ClusterSecurityProtocol.SSL);
                    clusterSecurityConfig.setKeystoreLocation(dtoSecurityConfig.getKeystoreLocation());
                    clusterSecurityConfig.setKeystorePassword(dtoSecurityConfig.getKeystorePassword());
                    clusterSecurityConfig.setKeyPassword(dtoSecurityConfig.getKeyPassword());
                    clusterSecurityConfig.setTruststoreLocation(dtoSecurityConfig.getTruststoreLocation());
                    clusterSecurityConfig.setTruststorePassword(dtoSecurityConfig.getTruststorePassword());
                    break;
                case AWS_MSK:
                    clusterSecurityConfig.setSecurityProtocol(ClusterSecurityProtocol.SASL_SSL);
                    clusterSecurityConfig.setSaslMechanism(ClusterSASLMechanism.AWS_MSK_IAM);
                    clusterSecurityConfig.setAwsProfileName(dtoSecurityConfig.getAwsProfileName());
                    break;
            }

            cluster.setClusterSecurityConfig(clusterSecurityConfig);
        }
    }
}
