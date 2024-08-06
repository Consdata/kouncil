package com.consdata.kouncil.config.cluster.converter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.consdata.kouncil.config.BrokerConfig;
import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.cluster.dto.BrokerDto;
import com.consdata.kouncil.config.cluster.dto.ClusterDto;
import com.consdata.kouncil.config.cluster.dto.ClusterSecurityConfigDto;
import com.consdata.kouncil.config.cluster.dto.SchemaRegistryDto;
import com.consdata.kouncil.config.cluster.dto.SchemaRegistrySecurityConfigDto;
import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.SchemaSecurityProtocol;
import java.util.HashSet;
import java.util.Map;
import org.apache.kafka.common.config.SaslConfigs;
import org.junit.jupiter.api.Test;

class ClusterConfigConverterTest {

    @Test
    void should_convert_cluster_dto_with_ssl_protocol_to_cluster_config() {
        ClusterDto cluster = new ClusterDto();
        cluster.setId(1L);
        cluster.setName("Kafka cluster");
        cluster.setGlobalJmxUser("JMX user");
        cluster.setGlobalJmxPassword("password");
        cluster.setGlobalJmxPort(8888);
        cluster.setBrokers(new HashSet<>());
        cluster.getBrokers().add(addBrokerDto("localhost:9092", "broker JMX user", "password", 8889));
        cluster.getBrokers().add(addBrokerDto("localhost:9093", null, null, null));
        cluster.setClusterSecurityConfig(new ClusterSecurityConfigDto());
        cluster.getClusterSecurityConfig().setSecurityProtocol(ClusterSecurityProtocol.SSL);
        cluster.getClusterSecurityConfig().setKeyPassword("password");
        cluster.getClusterSecurityConfig().setKeystorePassword("password");
        cluster.getClusterSecurityConfig().setKeystoreLocation("/location/to/keystore.jks");
        cluster.getClusterSecurityConfig().setTruststorePassword("password");
        cluster.getClusterSecurityConfig().setTruststoreLocation("/location/to/truststore.jks");
        cluster.setSchemaRegistry(new SchemaRegistryDto());
        cluster.getSchemaRegistry().setId(1L);
        cluster.getSchemaRegistry().setUrl("https://localhost:8085");
        cluster.getSchemaRegistry().setSchemaRegistrySecurityConfig(new SchemaRegistrySecurityConfigDto());
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setSecurityProtocol(SchemaSecurityProtocol.SSL);
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeyPassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeystorePassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeystoreLocation("/location/to/schema/keystore.jks");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setTruststorePassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setTruststoreLocation("/location/to/schema/truststore.jks");

        ClusterConfig clusterConfig = ClusterConfigConverter.convertToClusterConfig(cluster);

        assertAll(
                () -> assertThat(clusterConfig.getName()).isEqualTo("Kafka cluster"),
                () -> assertThat(clusterConfig.getBrokers()).hasSize(2),
                () -> assertThat(clusterConfig.getBrokers()).containsExactly(
                        addBrokerConfig("localhost", 9092, "JMX user", "password", 8888),
                        addBrokerConfig("localhost", 9093, "JMX user", "password", 8888)
                ),
                () -> assertThat(clusterConfig.getKafka().getSecurity().getProtocol()).isEqualTo("SSL"),
                () -> assertThat(clusterConfig.getKafka().getSsl().getKeyPassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getKafka().getSsl().getKeyStorePassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getKafka().getSsl().getKeyStoreLocation().getFile().getPath()).isEqualTo("/location/to/keystore.jks"),
                () -> assertThat(clusterConfig.getKafka().getSsl().getTrustStorePassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getKafka().getSsl().getTrustStoreLocation().getFile().getPath()).isEqualTo("/location/to/truststore.jks"),
                () -> assertThat(clusterConfig.getKafka().getProperties()).containsAllEntriesOf(Map.of()),
                () -> assertThat(clusterConfig.getSchemaRegistry()).isNotNull(),
                () -> assertThat(clusterConfig.getSchemaRegistry().getUrl()).isEqualTo("https://localhost:8085"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSecurity().getProtocol()).isEqualTo("SSL"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSsl().getKeyPassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSsl().getKeyStorePassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSsl().getKeyStoreLocation().getFile().getPath()).isEqualTo(
                        "/location/to/schema/keystore.jks"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSsl().getTrustStorePassword()).isEqualTo("password"),
                () -> assertThat(clusterConfig.getSchemaRegistry().getSsl().getTrustStoreLocation().getFile().getPath()).isEqualTo(
                        "/location/to/schema/truststore.jks")
        );
    }

    @Test
    void should_convert_cluster_dto_with_aws_msk_to_cluster_config() {
        ClusterDto cluster = new ClusterDto();
        cluster.setId(1L);
        cluster.setName("Kafka cluster");
        cluster.setBrokers(new HashSet<>());
        cluster.getBrokers().add(addBrokerDto("localhost:9092", "broker JMX user", "password", 8889));
        cluster.getBrokers().add(addBrokerDto("127.0.0.1:9093", null, null, null));
        cluster.setClusterSecurityConfig(new ClusterSecurityConfigDto());
        cluster.getClusterSecurityConfig().setSecurityProtocol(ClusterSecurityProtocol.SASL_SSL);
        cluster.getClusterSecurityConfig().setAuthenticationMethod(ClusterAuthenticationMethod.AWS_MSK);
        cluster.getClusterSecurityConfig().setSaslMechanism(ClusterSASLMechanism.AWS_MSK_IAM);
        cluster.getClusterSecurityConfig().setAwsProfileName("kouncil");

        ClusterConfig clusterConfig = ClusterConfigConverter.convertToClusterConfig(cluster);

        assertAll(
                () -> assertThat(clusterConfig.getName()).isEqualTo("Kafka cluster"),
                () -> assertThat(clusterConfig.getBrokers()).hasSize(2),
                () -> assertThat(clusterConfig.getBrokers()).containsExactly(
                        addBrokerConfig("localhost", 9092, "broker JMX user", "password", 8889),
                        addBrokerConfig("127.0.0.1", 9093, null, null, null)
                ),
                () -> assertThat(clusterConfig.getKafka().getProperties()).containsAllEntriesOf(
                        Map.of(
                                SaslConfigs.SASL_MECHANISM, "AWS_MSK_IAM",
                                SaslConfigs.SASL_JAAS_CONFIG, "software.amazon.msk.auth.iam.IAMLoginModule required awsProfileName=\"kouncil\";",
                                SaslConfigs.SASL_CLIENT_CALLBACK_HANDLER_CLASS, "software.amazon.msk.auth.iam.IAMClientCallbackHandler"
                        )
                )
        );
    }

    private BrokerConfig addBrokerConfig(String host, Integer port, String jmxUser, String jmxPassword, Integer jmxPort) {
        return BrokerConfig.builder()
                .host(host)
                .port(port)
                .jmxUser(jmxUser)
                .jmxPassword(jmxPassword)
                .jmxPort(jmxPort)
                .build();
    }

    private BrokerDto addBrokerDto(String bootstrapServer, String brokerJmxUser, String brokerJmxPassword, Integer brokerJmxPort) {
        BrokerDto brokerDto = new BrokerDto();
        brokerDto.setBootstrapServer(bootstrapServer);
        brokerDto.setJmxUser(brokerJmxUser);
        brokerDto.setJmxPassword(brokerJmxPassword);
        brokerDto.setJmxPort(brokerJmxPort);
        return brokerDto;
    }
}
