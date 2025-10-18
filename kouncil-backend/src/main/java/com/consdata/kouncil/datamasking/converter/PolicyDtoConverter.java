package com.consdata.kouncil.datamasking.converter;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.datamasking.Policy;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class PolicyDtoConverter {

    public static PolicyDto convertToDto(Policy policy) {
        PolicyDto policyDto = new PolicyDto();
        BeanUtils.copyProperties(policy, policyDto);
        return policyDto;
    }
}
