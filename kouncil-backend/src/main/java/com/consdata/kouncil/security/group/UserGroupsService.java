package com.consdata.kouncil.security.group;

import com.consdata.kouncil.config.security.UserPermissionsReloader;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.List;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserGroupsService {

    private final UserGroupRepository userGroupRepository;
    private final UserPermissionsReloader userPermissionsReloader;

    public List<UserGroupDto> getUserGroups() {
        return StreamSupport.stream(userGroupRepository.findAll().spliterator(), false)
                .map(UserGroupConverter::convertToUserGroupDto)
                .toList();
    }

    public void saveAll(List<UserGroupDto> userGroupDtoList) {
        userGroupRepository.saveAll(userGroupDtoList.stream().map(UserGroupConverter::convertToUserGroup).toList());
        userPermissionsReloader.reloadPermissions();
    }
}
