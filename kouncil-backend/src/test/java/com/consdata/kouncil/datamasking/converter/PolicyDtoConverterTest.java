package com.consdata.kouncil.datamasking.converter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.datamasking.MaskingType;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.model.datamasking.PolicyField;
import com.consdata.kouncil.model.datamasking.PolicyResource;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class PolicyDtoConverterTest {

    @Test
    void should_convert_to_dto() {
        //given
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setName("test");
        policy.setApplyToAllResources(false);
        policy.setMaskingType(MaskingType.ALL);
        policy.setFields(new HashSet<>());
        policy.getFields().add(createField(1L));
        policy.getFields().add(createField(2L));
        policy.getFields().add(createField(3L));
        policy.setResources(new HashSet<>());
        policy.getResources().add(createResource(1L));
        policy.getResources().add(createResource(2L));
        //when
        PolicyDto policyDto = PolicyDtoConverter.convertToDto(policy);
        //then
        assertAll(
                () -> assertThat(policyDto.getId()).isEqualTo(policy.getId()),
                () -> assertThat(policyDto.getName()).isEqualTo(policy.getName()),
                () -> assertThat(policyDto.getApplyToAllResources()).isEqualTo(policy.getApplyToAllResources()),
                () -> assertThat(policyDto.getMaskingType()).isEqualTo(policy.getMaskingType()),
                () -> assertThat(policyDto.getFields()).hasSize(policy.getFields().size()),
                () -> assertThat(policyDto.getResources()).hasSize(policy.getResources().size())
        );
    }

    private PolicyResource createResource(long id) {
        PolicyResource policyResource = new PolicyResource();
        policyResource.setId(id);
        return policyResource;
    }

    private PolicyField createField(long id) {
        PolicyField policyField = new PolicyField();
        policyField.setId(id);
        return policyField;
    }
}
