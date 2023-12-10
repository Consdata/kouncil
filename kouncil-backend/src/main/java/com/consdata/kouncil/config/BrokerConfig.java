package com.consdata.kouncil.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static java.lang.String.format;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BrokerConfig {

    private String host;
    private Integer port;
    private Integer jmxPort;
    private String jmxUser;
    private String jmxPassword;
    private String saslMechanism;
    private String saslProtocol;
    private String saslJassConfig;
    private String saslCallbackHandler;

    public String getAddress() {
        return format("%s:%s", host, port);
    }

    public boolean hasJmxConfig() {
        return jmxPort != null;
    }

    public boolean hasJmxCredentials() {
        return jmxUser != null && jmxPassword != null;
    }
}
