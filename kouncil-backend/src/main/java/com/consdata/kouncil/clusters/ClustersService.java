package com.consdata.kouncil.clusters;

import com.consdata.kouncil.clusters.converter.ClusterDtoConverter;
import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.clusters.dto.ClustersDto;
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
        all.forEach(cluster -> clusterDtos.add(ClusterDtoConverter.convertToClusterDto(cluster)));
        return ClustersDto.builder().clusters(clusterDtos).build();
    }
}
