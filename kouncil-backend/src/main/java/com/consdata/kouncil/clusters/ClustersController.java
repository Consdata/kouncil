package com.consdata.kouncil.clusters;

import com.consdata.kouncil.clusters.dto.ClustersDto;
import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ClustersController {

    private final ClustersService clustersService;

    @RolesAllowed({Fields.TOPIC_LIST, Fields.BROKERS_LIST, Fields.CLUSTER_LIST})
    @GetMapping(path = "/api/clusters")
    public ClustersDto getClusters() {
        return clustersService.getClusters();

    }
}