package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.clusters.ClustersService;
import com.consdata.kouncil.clusters.converter.ClusterConfigConverter;
import com.consdata.kouncil.clusters.dto.ClustersDto;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.web.exchanges.HttpExchangeRepository;
import org.springframework.boot.actuate.web.exchanges.InMemoryHttpExchangeRepository;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@Data
public class KouncilConfiguration {

    public static final String INSTALLATION_ID_FILE = "kouncil_installation_id.txt";

    private Map<String, ClusterConfig> clusterConfig;

    private String installationId;
    private final ClustersService clustersService;

    @PostConstruct
    public void initialize() {
        initializeClusters();
        generateInstallationId();
        log.info(toString());
    }

    public void initializeClusters() {
        this.clusterConfig = new HashMap<>();
        ClustersDto clusters = clustersService.getClusters();
        clusters.getClusters().forEach(cluster -> this.clusterConfig.put(cluster.getName(), ClusterConfigConverter.convertToClusterConfig(cluster)));
    }

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

    private void generateInstallationId() {
        Path path = Paths.get(INSTALLATION_ID_FILE);
        try {
            if (!Files.exists(path)) {
                installationId = UUID.randomUUID().toString();
                Files.write(path, installationId.getBytes());
            } else {
                installationId = Files.readString(path);
            }
        } catch (IOException e) {
            throw new KouncilRuntimeException("Failed to read installation id file", e);
        }
    }

    @Bean
    public HttpExchangeRepository httpTraceRepository() {
        return new InMemoryHttpExchangeRepository();
    }

    @Bean("fixedThreadPool")
    public ExecutorService executor() {
        return Executors.newFixedThreadPool(10);
    }

}
