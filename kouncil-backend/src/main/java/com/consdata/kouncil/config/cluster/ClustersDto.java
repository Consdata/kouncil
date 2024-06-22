package com.consdata.kouncil.config.cluster;

import com.consdata.kouncil.config.cluster.dto.ClusterDto;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClustersDto {

    private List<ClusterDto> clusters;
}
