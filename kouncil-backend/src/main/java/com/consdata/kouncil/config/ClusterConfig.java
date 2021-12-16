package com.consdata.kouncil.config;

import lombok.*;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;

import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClusterConfig {

    private String name;

    private Integer jmxPort;

    private String jmxUser;

    private String jmxPassword;

    private KafkaProperties kafka = new KafkaProperties();

    @Singular
    private List<BrokerConfig> brokers;

    public boolean hasJmxConfig() {
        return jmxPort != null;
    }

}
