package com.consdata.kouncil;

import lombok.AllArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
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
@AllArgsConstructor
public class KafkaConnectionService {

    private final KouncilConfiguration kouncilConfiguration;

    //we can cache this
    private Map<String, KafkaTemplate<String, String>> kafkaTemplates;
    //we can cache this
    private Map<String, AdminClient> adminClients;

    public KafkaTemplate<String, String> getKafkaTemplate(String serverId) {
        if (!kafkaTemplates.containsKey(serverId)) {
            Map<String, Object> props = new HashMap<>();
            props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, this.kouncilConfiguration.getServerById(serverId));
            props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            kafkaTemplates.put(serverId, new KafkaTemplate<>(new DefaultKafkaProducerFactory<>(props)));
        }
        return kafkaTemplates.get(serverId);
    }

    public AdminClient getAdminClient(String serverId) {
        if (!adminClients.containsKey(serverId)) {
            Properties props = new Properties();
            props.setProperty("bootstrap.servers", this.kouncilConfiguration.getServerById(serverId));
            props.setProperty("client.id", "Kouncil");
            props.setProperty("metadata.max.age.ms", "3000");
            props.setProperty("enable.auto.commit", "false");
            props.setProperty("auto.commit.interval.ms", "1000");
            props.setProperty("session.timeout.ms", "30000");
            props.setProperty("key.deserializer", StringDeserializer.class.getName());
            props.setProperty("value.deserializer", StringDeserializer.class.getName());
            adminClients.put(serverId, AdminClient.create(props));
        }
        return adminClients.get(serverId);
    }

    public KafkaConsumer<String, String> getKafkaConsumer(String serverId) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, this.kouncilConfiguration.getServerById(serverId));
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        return new KafkaConsumer<>(props);
    }

}
