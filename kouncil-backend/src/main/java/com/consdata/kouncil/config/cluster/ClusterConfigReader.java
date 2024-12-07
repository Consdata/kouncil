package com.consdata.kouncil.config.cluster;

import static java.lang.String.format;
import static org.apache.logging.log4j.util.Strings.isNotBlank;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.clusters.ClusterRepository;
import com.consdata.kouncil.config.BrokerConfig;
import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig;
import com.consdata.kouncil.config.SchemaRegistryConfig.SchemaRegistrySSL;
import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSASLMechanism;
import com.consdata.kouncil.model.cluster.ClusterSecurityConfig;
import com.consdata.kouncil.model.cluster.ClusterSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.SchemaAuthenticationMethod;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistrySecurityConfig;
import com.consdata.kouncil.model.schemaregistry.SchemaSecurityProtocol;
import com.consdata.kouncil.model.schemaregistry.StoreType;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties.Ssl;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @deprecated will be removed in the future.
 */
@Deprecated
@Component
@Data
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "kouncil")
@Slf4j
public class ClusterConfigReader {

    protected static final String SPECIAL_CHARS = "[^a-zA-Z0-9\\s]";
    private static final String HOST_PORT_SEPARATOR = ":";

    private final ClusterRepository repository;

    @Value("${bootstrapServers:}")
    private List<String> initialBootstrapServers = new ArrayList<>();

    @Value("${schemaRegistryUrl:}")
    private String schemaRegistryUrl;

    private List<ClusterConfig> clusters;

    @PostConstruct
    public void init() {
        List<Cluster> clustersToSave = new ArrayList<>();
        Iterable<Cluster> all = repository.findAll();
        //get saved cluster names to check if some clusters are not saved already
        List<String> clusterNames = StreamSupport.stream(all.spliterator(), false).map(Cluster::getName).toList();

        if (clusters != null) {
            initializeAdvancedConfig(clustersToSave, clusterNames);
        } else {
            initializeSimpleConfig(clustersToSave, clusterNames);
        }

        repository.saveAll(clustersToSave);
    }

    private void initializeAdvancedConfig(List<Cluster> clustersToSave, List<String> clusterNames) {
        clusters.forEach(clusterConfig -> {
            if (!clusterNames.contains(clusterConfig.getName())) {
                Cluster cluster = new Cluster();
                cluster.setName(clusterConfig.getName());

                //Global JMX properties
                cluster.setGlobalJmxPort(clusterConfig.getJmxPort());
                cluster.setGlobalJmxUser(clusterConfig.getJmxUser());
                cluster.setGlobalJmxPassword(clusterConfig.getJmxPassword());

                cluster.setClusterSecurityConfig(new ClusterSecurityConfig());
                cluster.getClusterSecurityConfig().setAuthenticationMethod(ClusterAuthenticationMethod.NONE);
                KafkaProperties kafkaProperties = clusterConfig.getKafka();

                if (kafkaProperties.getSecurity().getProtocol() != null) {
                    setClusterSSLConfig(cluster.getClusterSecurityConfig(), kafkaProperties.getSsl(), kafkaProperties.getSecurity().getProtocol());
                }
                setClusterSASLConfig(cluster.getClusterSecurityConfig(), clusterConfig.getBrokers());
                setBrokers(cluster, clusterConfig);
                setClusterSchemaRegistry(cluster, clusterConfig);

                clustersToSave.add(cluster);
            } else {
                log.warn("Cluster with name={} already exists", clusterConfig.getName());
            }
        });
    }

    private void initializeSimpleConfig(List<Cluster> clustersToSave, List<String> clusterNames) {
        for (String initialBootstrapServer : initialBootstrapServers) {
            String clusterId = sanitizeClusterId(initialBootstrapServer);
            if (!clusterNames.contains(clusterId)) {
                if (initialBootstrapServer.contains(HOST_PORT_SEPARATOR)) {
                    Cluster cluster = new Cluster();
                    cluster.setName(clusterId);
                    cluster.setClusterSecurityConfig(new ClusterSecurityConfig());
                    cluster.getClusterSecurityConfig().setAuthenticationMethod(ClusterAuthenticationMethod.NONE);
                    cluster.setBrokers(new HashSet<>());

                    Broker broker = new Broker();
                    broker.setBootstrapServer(initialBootstrapServer);
                    cluster.getBrokers().add(broker);

                    if (isNotBlank(schemaRegistryUrl)) {
                        SchemaRegistry schemaRegistry = new SchemaRegistry();
                        schemaRegistry.setUrl(schemaRegistryUrl);
                        cluster.setSchemaRegistry(schemaRegistry);
                    }

                    clustersToSave.add(cluster);
                } else {
                    throw new KouncilRuntimeException(format("Could not parse bootstrap server %s", initialBootstrapServer));
                }
            } else {
                log.warn("Cluster with name={} already exists", clusterId);
            }
        }
    }

    private void setClusterSASLConfig(ClusterSecurityConfig clusterSecurityConfig, List<BrokerConfig> brokers) {
        brokers.stream().filter(broker -> broker.getSaslProtocol() != null).forEach(
                broker -> {
                    clusterSecurityConfig.setSecurityProtocol(ClusterSecurityProtocol.valueOf(broker.getSaslProtocol()));
                    clusterSecurityConfig.setSaslMechanism(ClusterSASLMechanism.valueOf(broker.getSaslMechanism()));

                    String saslJassConfig = broker.getSaslJassConfig();

                    if (ClusterSecurityProtocol.SASL_PLAINTEXT.equals(clusterSecurityConfig.getSecurityProtocol())) {
                        clusterSecurityConfig.setUsername(getValueFromTextUsingRegex("username=\"(.*?)\"", saslJassConfig));
                        clusterSecurityConfig.setPassword(getValueFromTextUsingRegex("password=\"(.*?)\"", saslJassConfig));
                        clusterSecurityConfig.setAuthenticationMethod(ClusterAuthenticationMethod.SASL);
                    } else if (ClusterSASLMechanism.AWS_MSK_IAM.equals(clusterSecurityConfig.getSaslMechanism())) {
                        clusterSecurityConfig.setAwsProfileName(getValueFromTextUsingRegex("awsProfileName=\"(.*?)\"", saslJassConfig));
                        clusterSecurityConfig.setAuthenticationMethod(ClusterAuthenticationMethod.AWS_MSK);
                    }
                }
        );
    }

    private String getValueFromTextUsingRegex(String regex, String text) {
        Matcher matcher = Pattern.compile(regex).matcher(text);
        return matcher.find() ? matcher.group(1) : null;
    }

    private void setBrokers(Cluster cluster, ClusterConfig clusterConfig) {
        Set<Broker> brokers = new HashSet<>();
        clusterConfig.getBrokers().forEach(brokerConfig -> {
            Broker broker = new Broker();
            broker.setBootstrapServer(brokerConfig.getAddress());
            broker.setJmxUser(brokerConfig.getJmxUser());
            broker.setJmxPassword(brokerConfig.getJmxPassword());
            broker.setJmxPort(broker.getJmxPort());
            brokers.add(broker);
        });

        cluster.setBrokers(brokers);
    }

    private void setClusterSSLConfig(ClusterSecurityConfig clusterSecurityConfig, Ssl ssl, String protocol) {
        clusterSecurityConfig.setAuthenticationMethod(ClusterAuthenticationMethod.SSL);
        clusterSecurityConfig.setSecurityProtocol(ClusterSecurityProtocol.valueOf(protocol));

        if (ssl != null) {
            try {
                clusterSecurityConfig.setKeystoreLocation(ssl.getKeyStoreLocation().getFile().getAbsolutePath());
                clusterSecurityConfig.setKeystorePassword(ssl.getKeyStorePassword());
                clusterSecurityConfig.setKeyPassword(ssl.getKeyPassword());

                clusterSecurityConfig.setTruststoreLocation(ssl.getTrustStoreLocation().getFile().getAbsolutePath());
                clusterSecurityConfig.setTruststorePassword(ssl.getTrustStorePassword());
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }
        }
    }

    private void setClusterSchemaRegistry(Cluster cluster, ClusterConfig clusterConfig) {
        SchemaRegistryConfig schemaRegistryConfig = clusterConfig.getSchemaRegistry();
        if (schemaRegistryConfig != null) {
            SchemaRegistry schemaRegistry = new SchemaRegistry();
            schemaRegistry.setUrl(schemaRegistryConfig.getUrl());
            schemaRegistry.setSchemaRegistrySecurityConfig(new SchemaRegistrySecurityConfig());
            schemaRegistry.getSchemaRegistrySecurityConfig().setAuthenticationMethod(SchemaAuthenticationMethod.NONE);

            setSchemaRegistrySSL(schemaRegistry.getSchemaRegistrySecurityConfig(), schemaRegistryConfig);
            cluster.setSchemaRegistry(schemaRegistry);
        }
    }

    private void setSchemaRegistrySSL(SchemaRegistrySecurityConfig schemaRegistrySecurityConfig, SchemaRegistryConfig schemaRegistryConfig) {
        if (schemaRegistryConfig.getSecurity() != null && schemaRegistryConfig.getSecurity().getProtocol() != null) {
            schemaRegistrySecurityConfig.setSecurityProtocol(SchemaSecurityProtocol.valueOf(schemaRegistryConfig.getSecurity().getProtocol()));

            schemaRegistrySecurityConfig.setAuthenticationMethod(SchemaAuthenticationMethod.SSL);
            if (schemaRegistryConfig.getAuth() != null && schemaRegistryConfig.getAuth().getUserInfo() != null) {
                schemaRegistrySecurityConfig.setAuthenticationMethod(SchemaAuthenticationMethod.SSL_BASIC_AUTH);
                String[] userInfoSplit = schemaRegistryConfig.getAuth().getUserInfo().split(":");
                schemaRegistrySecurityConfig.setUsername(userInfoSplit[0]);
                schemaRegistrySecurityConfig.setPassword(userInfoSplit[1]);
            }

            try {
                SchemaRegistrySSL schemaRegistrySSL = schemaRegistryConfig.getSsl();

                schemaRegistrySecurityConfig.setKeyPassword(schemaRegistrySSL.getKeyPassword());
                schemaRegistrySecurityConfig.setKeystorePassword(schemaRegistrySSL.getKeyStorePassword());
                schemaRegistrySecurityConfig.setKeystoreType(StoreType.valueOf(schemaRegistrySSL.getKeyStoreType()));
                schemaRegistrySecurityConfig.setKeystoreLocation(schemaRegistrySSL.getKeyStoreLocation().getFile().getAbsolutePath());

                schemaRegistrySecurityConfig.setTruststoreType(StoreType.valueOf(schemaRegistrySSL.getTrustStoreType()));
                schemaRegistrySecurityConfig.setTruststoreLocation(schemaRegistrySSL.getTrustStoreLocation().getFile().getAbsolutePath());
                schemaRegistrySecurityConfig.setTruststorePassword(schemaRegistrySSL.getTrustStorePassword());
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }
        }
    }


    private String sanitizeClusterId(String serverId) {
        return serverId.replaceAll(SPECIAL_CHARS, "_");
    }
}
