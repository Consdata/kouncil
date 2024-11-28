package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@AllArgsConstructor
@RequestMapping("/api/policy")
public class PolicyController {

    private final PolicyService policyService;

    @RolesAllowed(SystemFunctionNameConstants.POLICY_DELETE)
    @DeleteMapping(path = "/{id}")
    public void deletePolicy(@PathVariable("id") Long id) {
        policyService.deletePolicy(id);
    }
}
