package com.consdata.kouncil;

import com.consdata.kouncil.config.KouncilConfiguration;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
public class KafkaConnectionService {

    private final KouncilConfiguration kouncilConfiguration;

    public KafkaConnectionService(KouncilConfiguration kouncilConfiguration) {
        this.kouncilConfiguration = kouncilConfiguration;
    }

    //we can cache this
    private final Map<String, KafkaTemplate<String, String>> kafkaTemplates = new HashMap<>();

    //we can cache this
    private final Map<String, AdminClient> adminClients = new HashMap<>();

    public KafkaTemplate<String, String> getKafkaTemplate(String serverId) {
        if (!kafkaTemplates.containsKey(serverId)) {
            Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildProducerProperties();
            props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, this.kouncilConfiguration.getServerByClusterId(serverId));
            props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            kafkaTemplates.put(serverId, new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(props)));
        }
        return kafkaTemplates.get(serverId);
    }

    public AdminClient getAdminClient(String serverId) {
        if (!adminClients.containsKey(serverId)) {
            Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildAdminProperties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, this.kouncilConfiguration.getServerByClusterId(serverId));
            adminClients.put(serverId, AdminClient.create(props));
        }
        return adminClients.get(serverId);
    }

    //we cannot cache this ever
    public KafkaConsumer<String, String> getKafkaConsumer(String serverId, int limit) {
        Map<String, Object> props = kouncilConfiguration.getKafkaProperties(serverId).buildConsumerProperties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, this.kouncilConfiguration.getServerByClusterId(serverId));
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, limit);
        return new KafkaConsumer<>(props);
    }

}
