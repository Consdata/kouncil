package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.datamasking.converter.PolicyConverter;
import com.consdata.kouncil.datamasking.converter.PolicyDtoConverter;
import com.consdata.kouncil.datamasking.dto.PolicyDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;

    public void savePolicy(PolicyDto policyDto) {
        policyRepository.save(PolicyConverter.convert(policyDto));
    }

    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    public PolicyDto getPolicyById(Long id) {
        return policyRepository.findById(id).map(PolicyDtoConverter::convertToDto)
                .orElseThrow(() -> new IllegalArgumentException(String.format("Policy with id=%s not found", id)));
    }
}
