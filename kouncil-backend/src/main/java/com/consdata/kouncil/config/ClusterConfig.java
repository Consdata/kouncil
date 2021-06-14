package com.consdata.kouncil.config;

import lombok.*;

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

    @Singular
    private List<BrokerConfig> brokers;

    public boolean hasJmxConfig() {
        return jmxPort != null;
    }

}
