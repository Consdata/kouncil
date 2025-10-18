package com.consdata.kouncil.datamasking.converter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;

import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.datamasking.dto.PolicyFieldDto;
import com.consdata.kouncil.datamasking.dto.PolicyResourceDto;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.model.datamasking.Policy;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.Test;

class PolicyConverterTest {

    @Test
    void should_convert_to_entity() {
        //given
        PolicyDto policyDto = new PolicyDto();
        policyDto.setId(1L);
        policyDto.setName("test");
        policyDto.setApplyToAllResources(false);
        policyDto.setFields(new HashSet<>());
        policyDto.getFields().add(createField(1L));
        policyDto.getFields().add(createField(2L));
        policyDto.getFields().add(createField(3L));
        policyDto.setResources(new HashSet<>());
        policyDto.getResources().add(createResource(1L));
        policyDto.getResources().add(createResource(2L));
        policyDto.setUserGroups(new HashSet<>());
        policyDto.getUserGroups().add(1L);
        policyDto.getUserGroups().add(2L);
        //when
        Policy policy = PolicyConverter.convert(policyDto, List.of(
                createUserGroup(1L),
                createUserGroup(2L),
                createUserGroup(3L)
        ));
        //then
        assertAll(
                () -> assertThat(policy.getId()).isEqualTo(policyDto.getId()),
                () -> assertThat(policy.getName()).isEqualTo(policyDto.getName()),
                () -> assertThat(policy.getApplyToAllResources()).isEqualTo(policyDto.getApplyToAllResources()),
                () -> assertThat(policy.getFields()).hasSize(policyDto.getFields().size()),
                () -> assertThat(policy.getResources()).hasSize(policyDto.getResources().size()),
                () -> assertThat(policy.getUserGroups()).hasSize(policyDto.getUserGroups().size())
        );
    }

    private UserGroup createUserGroup(long id) {
        UserGroup userGroup = new UserGroup();
        userGroup.setId(id);
        return userGroup;
    }

    private PolicyResourceDto createResource(long id) {
        PolicyResourceDto policyResource = new PolicyResourceDto();
        policyResource.setId(id);
        return policyResource;
    }

    private PolicyFieldDto createField(long id) {
        PolicyFieldDto policyField = new PolicyFieldDto();
        policyField.setId(id);
        return policyField;
    }
}
