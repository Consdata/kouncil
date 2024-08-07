package com.consdata.kouncil.clusters.converter;

import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.clusters.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.config.BrokerConfig;
import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig.SchemaRegistryAuth;
import com.consdata.kouncil.config.SchemaRegistryConfig.SchemaRegistrySSL;
import com.consdata.kouncil.config.SchemaRegistryConfig.SchemaRegistrySecurity;
import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import java.util.ArrayList;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.apache.kafka.common.config.SaslConfigs;
import org.springframework.core.io.PathResource;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ClusterConfigConverter {

    public static ClusterConfig convertToClusterConfig(ClusterDto clusterDto) {
        ClusterConfig clusterConfig = new ClusterConfig();
        clusterConfig.setName(clusterDto.getName());

        //brokers
        setClusterConfigBrokers(clusterConfig, clusterDto);

        //cluster security
        setClusterConfigSecurity(clusterConfig, clusterDto);

        //schema registry
        if (clusterDto.getSchemaRegistry() != null) {
            clusterConfig.setSchemaRegistry(convertToSchemaRegistryConfig(clusterDto));
        }

        return clusterConfig;
    }

    private static void setClusterConfigBrokers(ClusterConfig clusterConfig, ClusterDto clusterDto) {
        clusterConfig.setBrokers(new ArrayList<>());
        clusterDto.getBrokers().forEach(brokerDto -> {
            BrokerConfig brokerConfig = new BrokerConfig();
            String[] hostPort = brokerDto.getBootstrapServer().split(":");
            brokerConfig.setHost(hostPort[0]);
            brokerConfig.setPort(Integer.parseInt(hostPort[1]));
            brokerConfig.setJmxUser(brokerDto.getJmxUser());
            brokerConfig.setJmxPassword(brokerDto.getJmxPassword());
            brokerConfig.setJmxPort(brokerDto.getJmxPort());

            clusterConfig.getBrokers().add(brokerConfig);
        });

        if (clusterDto.getGlobalJmxPort() != null) {
            clusterConfig.getBrokers().forEach(broker -> broker.setJmxPort(clusterDto.getGlobalJmxPort()));
        }
        if (clusterDto.getGlobalJmxUser() != null) {
            clusterConfig.getBrokers().forEach(broker -> broker.setJmxUser(clusterDto.getGlobalJmxUser()));
        }
        if (clusterDto.getGlobalJmxPassword() != null) {
            clusterConfig.getBrokers().forEach(broker -> broker.setJmxPassword(clusterDto.getGlobalJmxPassword()));
        }
    }

    private static void setClusterConfigSecurity(ClusterConfig clusterConfig, ClusterDto clusterDto) {
        if (clusterDto.getClusterSecurityConfig() != null
                && !ClusterAuthenticationMethod.NONE.equals(clusterDto.getClusterSecurityConfig().getAuthenticationMethod())) {
            clusterConfig.getKafka().getSecurity().setProtocol(clusterDto.getClusterSecurityConfig().getSecurityProtocol().name());

            //ssl properties
            setSSLProperties(clusterConfig, clusterDto);

            if (clusterDto.getClusterSecurityConfig().getSaslMechanism() != null) {
                clusterConfig.getKafka().getProperties().put(SaslConfigs.SASL_MECHANISM, clusterDto.getClusterSecurityConfig().getSaslMechanism().name());
            }

            //sasl plain config properties
            setSASLPlainProperties(clusterConfig, clusterDto);

            //aws msk config properties
            setAWSMSKProperties(clusterConfig, clusterDto);
        }
    }

    private static void setSSLProperties(ClusterConfig clusterConfig, ClusterDto clusterDto) {
        if (ClusterSecurityProtocol.SSL.equals(clusterDto.getClusterSecurityConfig().getSecurityProtocol())) {
            clusterConfig.getKafka().getSsl().setKeyStoreLocation(clusterDto.getClusterSecurityConfig().getKeystoreLocation() != null
                    ? new PathResource(clusterDto.getClusterSecurityConfig().getKeystoreLocation())
                    : null);
            clusterConfig.getKafka().getSsl().setKeyStorePassword(clusterDto.getClusterSecurityConfig().getKeystorePassword());
            clusterConfig.getKafka().getSsl().setKeyPassword(clusterDto.getClusterSecurityConfig().getKeyPassword());

            clusterConfig.getKafka().getSsl().setTrustStoreLocation(clusterDto.getClusterSecurityConfig().getTruststoreLocation() != null
                    ? new PathResource(clusterDto.getClusterSecurityConfig().getTruststoreLocation())
                    : null);
            clusterConfig.getKafka().getSsl().setTrustStorePassword(clusterDto.getClusterSecurityConfig().getTruststorePassword());
        }
    }

    private static void setSASLPlainProperties(ClusterConfig clusterConfig, ClusterDto clusterDto) {
        if (clusterDto.getClusterSecurityConfig().getSaslMechanism() != null
                && ClusterSASLMechanism.PLAIN.equals(clusterDto.getClusterSecurityConfig().getSaslMechanism())) {
            clusterConfig.getKafka().getProperties().put(SaslConfigs.SASL_JAAS_CONFIG,
                    String.format("org.apache.kafka.common.security.plain.PlainLoginModule required username=\"%s\" password=\"%s\";",
                            clusterDto.getClusterSecurityConfig().getUsername(), clusterDto.getClusterSecurityConfig().getPassword()));
        }
    }

    private static void setAWSMSKProperties(ClusterConfig clusterConfig, ClusterDto clusterDto) {
        if (clusterDto.getClusterSecurityConfig().getSaslMechanism() != null
                && ClusterSASLMechanism.AWS_MSK_IAM.equals(clusterDto.getClusterSecurityConfig().getSaslMechanism())) {
            clusterConfig.getKafka().getProperties().put(SaslConfigs.SASL_JAAS_CONFIG,
                    String.format("software.amazon.msk.auth.iam.IAMLoginModule required awsProfileName=\"%s\";",
                            clusterDto.getClusterSecurityConfig().getAwsProfileName()));
            clusterConfig.getKafka().getProperties()
                    .put(SaslConfigs.SASL_CLIENT_CALLBACK_HANDLER_CLASS, "software.amazon.msk.auth.iam.IAMClientCallbackHandler");
        }
    }

    private static SchemaRegistryConfig convertToSchemaRegistryConfig(ClusterDto clusterDto) {
        SchemaRegistryConfig schemaRegistryConfig = new SchemaRegistryConfig();
        schemaRegistryConfig.setUrl(clusterDto.getSchemaRegistry().getUrl());

        SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfig = clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig();
        if (schemaRegistrySecurityConfig != null && schemaRegistrySecurityConfig.getSecurityProtocol() != null) {
            //security protocol
            SchemaRegistrySecurity schemaRegistrySecurity = new SchemaRegistrySecurity();
            schemaRegistrySecurity.setProtocol(schemaRegistrySecurityConfig.getSecurityProtocol().name());
            schemaRegistryConfig.setSecurity(schemaRegistrySecurity);

            //ssl
            schemaRegistryConfig.setSsl(convertToSchemaRegistrySSL(schemaRegistrySecurityConfig));

            //auth
            if (schemaRegistrySecurityConfig.getUsername() != null && schemaRegistrySecurityConfig.getPassword() != null) {
                SchemaRegistryAuth schemaRegistryAuth = new SchemaRegistryAuth();
                schemaRegistryAuth.setSource("USER_INFO");
                schemaRegistryAuth.setUserInfo(
                        String.format("%s:%s", schemaRegistrySecurityConfig.getUsername(), schemaRegistrySecurityConfig.getPassword()));
                schemaRegistryConfig.setAuth(schemaRegistryAuth);
            }

        }
        return schemaRegistryConfig;
    }

    private static SchemaRegistrySSL convertToSchemaRegistrySSL(SchemaRegistrySecurityConfigDto schemaRegistrySecurityConfig) {
        SchemaRegistrySSL schemaRegistrySSL = new SchemaRegistrySSL();
        schemaRegistrySSL.setKeyStoreType(schemaRegistrySecurityConfig.getKeystoreType() != null
                ? schemaRegistrySecurityConfig.getKeystoreType().name()
                : null);
        schemaRegistrySSL.setKeyStoreLocation(schemaRegistrySecurityConfig.getKeystoreLocation() != null
                ? new PathResource(schemaRegistrySecurityConfig.getKeystoreLocation())
                : null);
        schemaRegistrySSL.setKeyStorePassword(schemaRegistrySecurityConfig.getKeystorePassword());
        schemaRegistrySSL.setKeyPassword(schemaRegistrySecurityConfig.getKeyPassword());

        schemaRegistrySSL.setTrustStoreType(schemaRegistrySecurityConfig.getTruststoreType() != null
                ? schemaRegistrySecurityConfig.getTruststoreType().name()
                : null);
        schemaRegistrySSL.setTrustStoreLocation(schemaRegistrySecurityConfig.getTruststoreLocation() != null
                ? new PathResource(schemaRegistrySecurityConfig.getTruststoreLocation())
                : null);
        schemaRegistrySSL.setTrustStorePassword(schemaRegistrySecurityConfig.getTruststorePassword());
        return schemaRegistrySSL;
    }

}
