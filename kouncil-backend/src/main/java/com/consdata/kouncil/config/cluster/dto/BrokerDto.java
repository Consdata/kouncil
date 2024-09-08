package com.consdata.kouncil.config.cluster.dto;

import lombok.Data;

@Data
public class BrokerDto {

    private Long id;
    private String bootstrapServer;
    private Integer jmxPort;
    private String jmxUser;
    private String jmxPassword;
}
