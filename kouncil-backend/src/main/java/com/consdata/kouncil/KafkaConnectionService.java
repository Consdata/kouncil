package com.consdata.kouncil;

import static org.apache.logging.log4j.util.Strings.isNotBlank;

import com.consdata.kouncil.config.BrokerConfig;
import com.consdata.kouncil.config.KouncilConfiguration;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.serialization.BytesDeserializer;
import org.apache.kafka.common.serialization.BytesSerializer;
import org.apache.kafka.common.utils.Bytes;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConnectionService {

    protected static final String RECONNECT_BACKOFF_MS_CONFIG_CONSTANT_VALUE = "5000";
    protected static final String RECONNECT_BACKOFF_MAX_MS_CONFIG_CONSTANT_VALUE = "10000";
    private final KouncilConfiguration kouncilConfiguration;
    //we can cache this
    private final Map<String, KafkaTemplate<Bytes, Bytes>> kafkaTemplates = new ConcurrentHashMap<>();
    //we can cache this
    private final Map<String, AdminClient> adminClients = new ConcurrentHashMap<>();

    public KafkaConnectionService(KouncilConfiguration kouncilConfiguration) {
        this.kouncilConfiguration = kouncilConfiguration;
    }

    public KafkaTemplate<Bytes, Bytes> getKafkaTemplate(String serverId) {
        return kafkaTemplates.computeIfAbsent(serverId, k -> {
            Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildProducerProperties(null);
            String serverByClusterId = this.kouncilConfiguration.getServerByClusterId(serverId);

            props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, serverByClusterId);
            props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, BytesSerializer.class);
            props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, BytesSerializer.class);
            props.put(ProducerConfig.RECONNECT_BACKOFF_MS_CONFIG, RECONNECT_BACKOFF_MS_CONFIG_CONSTANT_VALUE);
            props.put(ProducerConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, RECONNECT_BACKOFF_MAX_MS_CONFIG_CONSTANT_VALUE);

            addJAASProperties(props, serverByClusterId, serverId);
            return new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(props));
        });
    }

    public AdminClient getAdminClient(String serverId) {
        return adminClients.computeIfAbsent(serverId, k -> {
            Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildAdminProperties(null);
            String serverByClusterId = this.kouncilConfiguration.getServerByClusterId(serverId);
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, serverByClusterId);
            props.put(AdminClientConfig.RECONNECT_BACKOFF_MS_CONFIG, RECONNECT_BACKOFF_MS_CONFIG_CONSTANT_VALUE);
            props.put(AdminClientConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, RECONNECT_BACKOFF_MAX_MS_CONFIG_CONSTANT_VALUE);

            addJAASProperties(props, serverByClusterId, serverId);
            return AdminClient.create(props);
        });
    }

    private void addJAASProperties(Map<String, Object> props, String serverByClusterId, String serverId) {
        String[] hostPort = serverByClusterId.split(":");
        Optional<BrokerConfig> brokerConfigFromCluster = kouncilConfiguration.getBrokerConfigFromCluster(serverId, hostPort[0], Integer.parseInt(hostPort[1]));
        if (brokerConfigFromCluster.isPresent()) {
            BrokerConfig brokerConfig = brokerConfigFromCluster.get();
            if (isNotBlank(brokerConfig.getSaslMechanism())) {
                props.put(SaslConfigs.SASL_MECHANISM, brokerConfig.getSaslMechanism());
            }
            if (isNotBlank(brokerConfig.getSaslProtocol())) {
                props.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, brokerConfig.getSaslProtocol());
            }
            if (isNotBlank(brokerConfig.getSaslJassConfig())) {
                props.put(SaslConfigs.SASL_JAAS_CONFIG, brokerConfig.getSaslJassConfig());
            }
            if (isNotBlank(brokerConfig.getSaslCallbackHandler())) {
                props.put(SaslConfigs.SASL_CLIENT_CALLBACK_HANDLER_CLASS, brokerConfig.getSaslCallbackHandler());
            }
        }
    }

    //we cannot cache this ever
    public KafkaConsumer<Bytes, Bytes> getKafkaConsumer(String serverId, int limit) {
        Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildConsumerProperties(null);
        String serverByClusterId = this.kouncilConfiguration.getServerByClusterId(serverId);

        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, serverByClusterId);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, BytesDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, limit);
        props.put(ConsumerConfig.RECONNECT_BACKOFF_MS_CONFIG, RECONNECT_BACKOFF_MS_CONFIG_CONSTANT_VALUE);
        props.put(ConsumerConfig.RECONNECT_BACKOFF_MAX_MS_CONFIG, RECONNECT_BACKOFF_MAX_MS_CONFIG_CONSTANT_VALUE);

        addJAASProperties(props, serverByClusterId, serverId);
        return new KafkaConsumer<>(props);
    }

    public void cleanAdminClients() {
        this.adminClients.clear();
    }
}
