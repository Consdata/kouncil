package com.consdata.kouncil.config.cluster;

import static com.consdata.kouncil.config.security.RoleNames.ADMIN_ROLE;
import static com.consdata.kouncil.config.security.RoleNames.EDITOR_ROLE;

import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class ClustersController {

    private final ClustersService clustersService;

    @RolesAllowed({EDITOR_ROLE, ADMIN_ROLE})
    @GetMapping(path = "/api/clusters")
    public ClustersDto getClusters() {
        return clustersService.getClusters();

    }
}
