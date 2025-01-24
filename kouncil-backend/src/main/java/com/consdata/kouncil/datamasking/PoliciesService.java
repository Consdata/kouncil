package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.datamasking.converter.PolicyDtoConverter;
import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.datamasking.Policy;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class PoliciesService {

    private final PolicyRepository policyRepository;

    public List<PolicyDto> getPolicies(){
        Iterable<Policy> all = policyRepository.findAll();
        List<PolicyDto> policies = new ArrayList<>();
        all.forEach(policy -> policies.add(PolicyDtoConverter.convertToDto(policy)));
        return policies;
    }
}
