package com.consdata.kouncil.datamasking.dto;

import com.consdata.kouncil.clusters.dto.ClusterDto;
import lombok.Data;

@Data
public class PolicyResourceDto {

    private Long id;
    private ClusterDto cluster;
    private String topic;
}
