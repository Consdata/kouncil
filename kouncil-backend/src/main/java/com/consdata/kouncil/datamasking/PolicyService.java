package com.consdata.kouncil.datamasking;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;

    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }
}
