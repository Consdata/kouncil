package com.consdata.kouncil.clusters.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClustersDto {

    private List<ClusterDto> clusters;
}
