package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.trace.http.HttpTraceRepository;
import org.springframework.boot.actuate.trace.http.InMemoryHttpTraceRepository;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static java.lang.String.format;
import static java.util.stream.Collectors.toMap;
import static org.apache.logging.log4j.util.Strings.isNotBlank;

@Component
@Slf4j
@Data
@ConfigurationProperties(prefix = "kouncil")
public class KouncilConfiguration {

    protected static final String SPECIAL_CHARS = "[^a-zA-Z0-9\\s]";

    private static final String HOST_PORT_SEPARATOR = ":";

    @Value("${bootstrapServers:}")
    private List<String> initialBootstrapServers = new ArrayList<>();

    @Value("${schemaRegistryUrl:}")
    private String schemaRegistryUrl;

    private List<SaslBrokerConfig> sasl;

    private List<ClusterConfig> clusters;

    private Map<String, ClusterConfig> clusterConfig;

    /**
     * @return first known broker from given cluster
     */
    public String getServerByClusterId(String clusterId) {
        ClusterConfig server = clusterConfig.get(clusterId);
        if (Objects.isNull(server)) {
            throw new KouncilRuntimeException("Unknown clusterId");
        } else {
            return server
                    .getBrokers()
                    .stream()
                    .findFirst()
                    .map(BrokerConfig::getAddress)
                    .orElseThrow(() -> new KouncilRuntimeException("Broker not found"));
        }
    }

    public KafkaProperties getKafkaProperties(String clusterId) {
        return clusterConfig.get(clusterId).getKafka();
    }

    public Optional<BrokerConfig> getBrokerConfigFromCluster(String clusterId, String host, int port) {
        return clusterConfig
                .get(clusterId)
                .getBrokers()
                .stream()
                .filter(b -> compareHosts(host, b.getHost()) && b.getPort().equals(port))
                .findFirst();
    }

    /**
     * hosts may be specified either in IP or hostname form, this method allows us to compare them regardless of their form
     */
    private boolean compareHosts(String host1, String host2) {
        try {
            InetAddress host1InetAddress = InetAddress.getByName(host1);
            InetAddress host2InetAddress = InetAddress.getByName(host2);
            return host1InetAddress.getHostAddress().equals(host2InetAddress.getHostAddress());
        } catch (UnknownHostException e) {
            log.warn("Could not compare hosts {} - {}", host1, host2, e);
            return false;
        }
    }

    @PostConstruct
    public void initialize() {
        if (clusters != null) {
            initializeAdvancedConfig();
        } else {
            initializeSimpleConfig();
        }
        log.info(toString());
    }

    private void initializeSimpleConfig() {
        log.info("Using simple Kouncil configuration: bootstrapServers={}, schemaRegistryUrl={}", initialBootstrapServers, schemaRegistryUrl);
        log.info("{}", sasl);
        clusterConfig = new HashMap<>();
        for (String initialBootstrapServer : initialBootstrapServers) {
            String clusterId = sanitizeClusterId(initialBootstrapServer);
            if (initialBootstrapServer.contains(HOST_PORT_SEPARATOR)) {
                String[] split = initialBootstrapServer.split(HOST_PORT_SEPARATOR);
                String brokerHost = split[0];
                int brokerPort = Integer.parseInt(split[1]);
                ClusterConfig simpleClusterConfig = ClusterConfig
                        .builder()
                        .name(clusterId)
                        .kafka(new KafkaProperties())
                        .broker(BrokerConfig
                                .builder()
                                .host(brokerHost)
                                .port(brokerPort)
                                .build())
                        .build();

                if (isNotBlank(schemaRegistryUrl)) {
                    simpleClusterConfig.setSchemaRegistry(SchemaRegistryConfig.builder()
                            .url(schemaRegistryUrl)
                            .build());
                }
                initializeSaslBrokerConfig(initialBootstrapServer, brokerHost, brokerPort, simpleClusterConfig);
                this.clusterConfig.put(clusterId, simpleClusterConfig);
            } else {
                throw new KouncilRuntimeException(format("Could not parse bootstrap server %s", initialBootstrapServer));
            }
        }
    }

    private void initializeSaslBrokerConfig(String initialBootstrapServer, String brokerHost, int brokerPort, ClusterConfig simpleClusterConfig) {
        Optional<SaslBrokerConfig> brokerSasl = getBrokerSasl(initialBootstrapServer);
        if (brokerSasl.isPresent()) {
            SaslBrokerConfig saslBrokerConfig = brokerSasl.get();
            Optional<BrokerConfig> brokerConfigFromCluster = simpleClusterConfig
                    .getBrokers()
                    .stream()
                    .filter(broker -> compareHosts(brokerHost, broker.getHost()) && broker.getPort().equals(brokerPort))
                    .findFirst();

            if (brokerConfigFromCluster.isPresent()) {
                BrokerConfig brokerConfig = brokerConfigFromCluster.get();
                brokerConfig.setSaslUsername(saslBrokerConfig.getUsername());
                brokerConfig.setSaslPassword(saslBrokerConfig.getPassword());
            }
        }
    }

    private Optional<SaslBrokerConfig> getBrokerSasl(String initialBootstrapServer) {
        return sasl.stream().filter(brokerConfig -> initialBootstrapServer.equals(brokerConfig.getBrokerUrl())).findFirst();
    }

    private void initializeAdvancedConfig() {
        log.info("Advanced Kouncil configuration present, {}", clusters);
        clusterConfig = clusters.stream()
                .collect(toMap(
                        cluster -> sanitizeClusterId(cluster.getName()),
                        cluster -> cluster
                ));

        log.info("Propagating jmx config values from clusters to brokers");
        clusterConfig.values().forEach(cluster -> {
            if (cluster.getJmxPort() != null) {
                log.info("Propagating JMX port {} from cluster {} to brokers", cluster.getJmxPort(), cluster.getName());
                cluster.getBrokers().forEach(broker -> broker.setJmxPort(cluster.getJmxPort()));
            }
            if (cluster.getJmxUser() != null) {
                log.info("Propagating JMX user {} from cluster {} to brokers", cluster.getJmxUser(), cluster.getName());
                cluster.getBrokers().forEach(broker -> broker.setJmxUser(cluster.getJmxUser()));
            }
            if (cluster.getJmxPassword() != null) {
                log.info("Propagating JMX password from cluster {} to brokers", cluster.getName());
                cluster.getBrokers().forEach(broker -> broker.setJmxPassword(cluster.getJmxPassword()));
            }
        });
    }

    private String sanitizeClusterId(String serverId) {
        return serverId.replaceAll(SPECIAL_CHARS, "_");
    }

    @Bean
    public HttpTraceRepository httpTraceRepository() {
        return new InMemoryHttpTraceRepository();
    }

    @Bean("fixedThreadPool")
    public ExecutorService executor() {
        return Executors.newFixedThreadPool(10);
    }

}
