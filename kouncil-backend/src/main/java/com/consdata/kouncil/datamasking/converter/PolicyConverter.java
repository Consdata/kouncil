package com.consdata.kouncil.datamasking.converter;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.model.datamasking.PolicyField;
import com.consdata.kouncil.model.datamasking.PolicyResource;
import java.util.HashSet;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PolicyConverter {

    public static Policy convert(PolicyDto policyDto) {
        Policy policy = new Policy();
        BeanUtils.copyProperties(policyDto, policy);

        policy.setFields(new HashSet<>());

        policyDto.getFields().forEach(field -> {
            PolicyField policyField = new PolicyField();
            BeanUtils.copyProperties(field, policyField);
            policy.getFields().add(policyField);
        });

        policy.setResources(new HashSet<>());
        policyDto.getResources().forEach(resource -> {
            PolicyResource policyResource = new PolicyResource();
            BeanUtils.copyProperties(resource, policyResource);
            policy.getResources().add(policyResource);
        });

        return policy;
    }
}
