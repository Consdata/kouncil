package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import java.util.List;
import jakarta.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class PoliciesController {

    private final PoliciesService policyService;

    @RolesAllowed({SystemFunctionNameConstants.POLICY_LIST})
    @GetMapping(path = "/api/policies")
    public List<PolicyDto> getPolicies() {
        return policyService.getPolicies();

    }
}
