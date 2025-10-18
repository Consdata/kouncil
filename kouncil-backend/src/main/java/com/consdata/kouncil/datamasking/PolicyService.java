package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.datamasking.converter.PolicyConverter;
import com.consdata.kouncil.datamasking.converter.PolicyDtoConverter;
import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.group.UserGroupRepository;
import java.util.List;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserGroupRepository userGroupRepository;

    public void savePolicy(PolicyDto policyDto) {
        List<UserGroup> userGroups = StreamSupport.stream(userGroupRepository.findAll().spliterator(), false).toList();
        policyRepository.save(PolicyConverter.convert(policyDto, userGroups));
    }

    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    public PolicyDto getPolicyById(Long id) {
        return policyRepository.findById(id).map(PolicyDtoConverter::convertToDto)
                .orElseThrow(() -> new IllegalArgumentException(String.format("Policy with id=%s not found", id)));
    }
}
