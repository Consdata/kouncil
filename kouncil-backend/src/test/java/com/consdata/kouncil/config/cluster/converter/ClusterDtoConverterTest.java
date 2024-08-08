package com.consdata.kouncil.config.cluster.converter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.consdata.kouncil.clusters.converter.ClusterDtoConverter;
import com.consdata.kouncil.clusters.dto.BrokerDto;
import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.cluster.ClusterSecurityConfig;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistrySecurityConfig;
import com.consdata.kouncil.model.schemaregistry.SchemaSecurityProtocol;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class ClusterDtoConverterTest {

    @Test
    void should_convert_cluster_to_cluster_dto() {
        Cluster cluster = new Cluster();
        cluster.setId(1L);
        cluster.setName("Kafka cluster");
        cluster.setGlobalJmxUser("JMX user");
        cluster.setGlobalJmxPassword("password");
        cluster.setGlobalJmxPort(8888);
        cluster.setBrokers(new HashSet<>());
        cluster.getBrokers().add(addBroker(1L, "localhost:9092", "broker JMX user", "password", 8889));
        cluster.getBrokers().add(addBroker(2L, "localhost:9093", null, null, null));
        cluster.setClusterSecurityConfig(new ClusterSecurityConfig());
        cluster.getClusterSecurityConfig().setSecurityProtocol(ClusterSecurityProtocol.SSL);
        cluster.getClusterSecurityConfig().setKeyPassword("password");
        cluster.getClusterSecurityConfig().setKeystorePassword("password");
        cluster.getClusterSecurityConfig().setKeystoreLocation("/location/to/keystore.jks");
        cluster.getClusterSecurityConfig().setTruststorePassword("password");
        cluster.getClusterSecurityConfig().setTruststoreLocation("/location/to/truststore.jks");
        cluster.setSchemaRegistry(new SchemaRegistry());
        cluster.getSchemaRegistry().setId(1L);
        cluster.getSchemaRegistry().setUrl("http://localhost:8085");
        cluster.getSchemaRegistry().setSchemaRegistrySecurityConfig(new SchemaRegistrySecurityConfig());
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setSecurityProtocol(SchemaSecurityProtocol.SSL);
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeyPassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeystorePassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setKeystoreLocation("/location/to/schema/keystore.jks");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setTruststorePassword("password");
        cluster.getSchemaRegistry().getSchemaRegistrySecurityConfig().setTruststoreLocation("/location/to/schema/truststore.jks");

        ClusterDto clusterDto = ClusterDtoConverter.convertToClusterDto(cluster);

        assertAll(
                () -> assertThat(clusterDto.getId()).isEqualTo(1L),
                () -> assertThat(clusterDto.getName()).isEqualTo("Kafka cluster"),
                () -> assertThat(clusterDto.getGlobalJmxUser()).isEqualTo("JMX user"),
                () -> assertThat(clusterDto.getGlobalJmxPassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getGlobalJmxPort()).isEqualTo(8888),
                () -> assertThat(clusterDto.getBrokers()).hasSize(2),
                () -> assertThat(clusterDto.getBrokers()).containsExactlyInAnyOrder(
                        addBrokerDto(1L, "localhost:9092", "broker JMX user", "password", 8889),
                        addBrokerDto(2L, "localhost:9093", null, null, null)
                ),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getSecurityProtocol()).isEqualTo(ClusterSecurityProtocol.SSL),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getKeyPassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getKeystorePassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getKeystoreLocation()).isEqualTo("/location/to/keystore.jks"),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getTruststorePassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getClusterSecurityConfig().getTruststoreLocation()).isEqualTo("/location/to/truststore.jks"),
                () -> assertThat(clusterDto.getSchemaRegistry().getId()).isEqualTo(1L),
                () -> assertThat(clusterDto.getSchemaRegistry().getUrl()).isEqualTo("http://localhost:8085"),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getSecurityProtocol()).isEqualTo(SchemaSecurityProtocol.SSL),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getKeyPassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getKeystorePassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getKeystoreLocation()).isEqualTo(
                        "/location/to/schema/keystore.jks"),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getTruststorePassword()).isEqualTo("password"),
                () -> assertThat(clusterDto.getSchemaRegistry().getSchemaRegistrySecurityConfig().getTruststoreLocation()).isEqualTo(
                        "/location/to/schema/truststore.jks")
        );
    }

    private Broker addBroker(long id, String bootstrapServer, String brokerJmxUser, String brokerJmxPassword, Integer brokerJmxPort) {
        Broker broker = new Broker();
        broker.setId(id);
        broker.setBootstrapServer(bootstrapServer);
        broker.setJmxUser(brokerJmxUser);
        broker.setJmxPassword(brokerJmxPassword);
        broker.setJmxPort(brokerJmxPort);
        return broker;
    }

    private BrokerDto addBrokerDto(long id, String bootstrapServer, String brokerJmxUser, String brokerJmxPassword, Integer brokerJmxPort) {
        BrokerDto brokerDto = new BrokerDto();
        brokerDto.setId(id);
        brokerDto.setBootstrapServer(bootstrapServer);
        brokerDto.setJmxUser(brokerJmxUser);
        brokerDto.setJmxPassword(brokerJmxPassword);
        brokerDto.setJmxPort(brokerJmxPort);
        return brokerDto;
    }
}
