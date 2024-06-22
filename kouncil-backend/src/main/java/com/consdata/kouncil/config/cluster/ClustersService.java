package com.consdata.kouncil.config.cluster;

import com.consdata.kouncil.config.cluster.converter.ClusterConverter;
import com.consdata.kouncil.config.cluster.dto.ClusterDto;
import com.consdata.kouncil.model.cluster.Cluster;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ClustersService {

    private final ClusterRepository clusterRepository;

    public ClustersDto getClusters() {
        Iterable<Cluster> all = clusterRepository.findAll();
        List<ClusterDto> clusterDtos = new ArrayList<>();
        all.forEach(cluster -> clusterDtos.add(ClusterConverter.convertToClusterDto(cluster)));
        return ClustersDto.builder().clusters(clusterDtos).build();
    }
}
