package com.consdata.kouncil.config.cluster;

import com.consdata.kouncil.model.admin.FunctionName.Fields;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ClustersController {

    private final ClustersService clustersService;

    @RolesAllowed({Fields.TOPIC_LIST, Fields.BROKERS_LIST})
    @GetMapping(path = "/api/clusters")
    public ClustersDto getClusters() {
        return clustersService.getClusters();

    }
}
