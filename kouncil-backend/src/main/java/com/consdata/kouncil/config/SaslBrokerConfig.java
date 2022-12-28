package com.consdata.kouncil.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaslBrokerConfig {

    private String brokerUrl;
    private String username;
    private String password;
}
