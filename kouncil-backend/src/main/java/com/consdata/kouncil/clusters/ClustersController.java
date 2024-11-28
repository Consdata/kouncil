package com.consdata.kouncil.clusters;

import com.consdata.kouncil.clusters.dto.ClustersDto;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ClustersController {

    private final ClustersService clustersService;

    @RolesAllowed({SystemFunctionNameConstants.TOPIC_LIST, SystemFunctionNameConstants.BROKERS_LIST, SystemFunctionNameConstants.CLUSTER_LIST})
    @GetMapping(path = "/api/clusters")
    public ClustersDto getClusters() {
        return clustersService.getClusters();

    }
}
