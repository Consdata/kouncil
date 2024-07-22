package com.consdata.kouncil.clusters;

import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.model.admin.FunctionName.Fields;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ClusterController {

    private final ClusterService clusterService;

    @RolesAllowed({Fields.CLUSTER_UPDATE, Fields.CLUSTER_DETAILS})
    @GetMapping(path = "/api/cluster/{clusterName}")
    public ClusterDto getClusterByName(@PathVariable("clusterName") String clusterName) {
        return clusterService.getClusterByName(clusterName);
    }

    @RolesAllowed(Fields.CLUSTER_CREATE)
    @PostMapping(path = "/api/cluster")
    public String addNewCluster(@RequestBody ClusterDto cluster) {
        return clusterService.saveCluster(cluster);
    }

    @RolesAllowed(Fields.CLUSTER_UPDATE)
    @PutMapping(path = "/api/cluster")
    public String updateCluster(@RequestBody ClusterDto cluster) {
        return clusterService.saveCluster(cluster);
    }

    @RolesAllowed({Fields.CLUSTER_CREATE, Fields.CLUSTER_UPDATE})
    @PostMapping(path = "/api/cluster/testConnection")
    public boolean testConnection(@RequestBody ClusterDto cluster) {
        return clusterService.testConnection(cluster);
    }

    @RolesAllowed({Fields.CLUSTER_CREATE, Fields.CLUSTER_UPDATE})
    @GetMapping(path = "/api/cluster/{clusterName}/isClusterNameUnique")
    public boolean isClusterNameUnique(@PathVariable("clusterName") String clusterName) {
        return clusterService.isClusterNameUnique(clusterName);
    }
}
