package com.consdata.kouncil.datamasking.converter;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.datamasking.dto.PolicyFieldDto;
import com.consdata.kouncil.datamasking.dto.PolicyResourceDto;
import com.consdata.kouncil.model.datamasking.Policy;
import java.util.HashSet;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PolicyDtoConverter {

    public static PolicyDto convertToDto(Policy policy) {
        PolicyDto policyDto = new PolicyDto();
        BeanUtils.copyProperties(policy, policyDto);

        policyDto.setFields(new HashSet<>());
        policy.getFields().forEach(field -> {
            PolicyFieldDto policyFieldDto = new PolicyFieldDto();
            BeanUtils.copyProperties(field, policyFieldDto);
            policyDto.getFields().add(policyFieldDto);
        });


        policyDto.setResources(new HashSet<>());
        policy.getResources().forEach(resource -> {
            PolicyResourceDto policyResource = new PolicyResourceDto();
            BeanUtils.copyProperties(resource, policyResource);
            policyDto.getResources().add(policyResource);
        });

        return policyDto;
    }
}
