package com.consdata.kouncil.clusters;

import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/api/cluster")
public class ClusterController {

    private final ClusterService clusterService;

    @RolesAllowed({SystemFunctionNameConstants.CLUSTER_UPDATE, SystemFunctionNameConstants.CLUSTER_DETAILS})
    @GetMapping(path = "/{clusterName}")
    public ClusterDto getClusterByName(@PathVariable("clusterName") String clusterName) {
        return clusterService.getClusterByName(clusterName);
    }

    @RolesAllowed(SystemFunctionNameConstants.CLUSTER_CREATE)
    @PostMapping
    public String addNewCluster(@RequestBody ClusterDto cluster) {
        return clusterService.saveCluster(cluster);
    }

    @RolesAllowed(SystemFunctionNameConstants.CLUSTER_UPDATE)
    @PutMapping
    public String updateCluster(@RequestBody ClusterDto cluster) {
        return clusterService.saveCluster(cluster);
    }

    @RolesAllowed({SystemFunctionNameConstants.CLUSTER_CREATE, SystemFunctionNameConstants.CLUSTER_UPDATE})
    @PostMapping(path = "/testConnection")
    public boolean testConnection(@RequestBody ClusterDto cluster) {
        return clusterService.testConnection(cluster);
    }

    @RolesAllowed({SystemFunctionNameConstants.CLUSTER_CREATE, SystemFunctionNameConstants.CLUSTER_UPDATE})
    @GetMapping(path = "/{clusterName}/isClusterNameUnique")
    public boolean isClusterNameUnique(@PathVariable("clusterName") String clusterName) {
        return clusterService.isClusterNameUnique(clusterName);
    }

    @RolesAllowed(SystemFunctionNameConstants.CLUSTER_DELETE)
    @DeleteMapping(path = "/{id}")
    public void deleteCluster(@PathVariable("id") Long id) {
        clusterService.deleteCluster(id);
    }
}
