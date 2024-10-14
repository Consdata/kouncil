package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
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
@RequestMapping("/api/policy")
public class PolicyController {

    private final PolicyService policyService;

    @RolesAllowed({Fields.POLICY_DETAILS, Fields.POLICY_UPDATE})
    @GetMapping(path = "/{policyId}")
    public PolicyDto getPolicyById(@PathVariable("policyId") Long id) {
        return policyService.getPolicyById(id);
    }

    @RolesAllowed(Fields.POLICY_CREATE)
    @PostMapping()
    public void addNewPolicy(@RequestBody PolicyDto policyDto) {
        policyService.savePolicy(policyDto);
    }

    @RolesAllowed(Fields.POLICY_UPDATE)
    @PutMapping()
    public void updatePolicy(@RequestBody PolicyDto policyDto) {
        policyService.savePolicy(policyDto);
    }

    @RolesAllowed(Fields.POLICY_DELETE)
    @DeleteMapping(path = "/{id}")
    public void deletePolicy(@PathVariable("id") Long id) {
        policyService.deletePolicy(id);
    }
}
