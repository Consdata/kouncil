package com.consdata.kouncil.security.group;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.security.UserPermissionsReloader;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserGroupService {

    private final UserGroupRepository userGroupRepository;
    private final UserPermissionsReloader userPermissionsReloader;

    public UserGroupDto getUserGroup(Long id) {
        return UserGroupConverter.convertToUserGroupDto(findById(id));
    }

    private UserGroup findById(Long id) {
        return userGroupRepository.findById(id).orElseThrow(() -> new KouncilRuntimeException("User group not found"));
    }

    public void createUserGroup(UserGroupDto userGroup) {
        userGroupRepository.save(UserGroupConverter.updateUserGroup(userGroup, new UserGroup()));
    }

    public void updateUserGroup(UserGroupDto userGroup) {
        userGroupRepository.save(UserGroupConverter.updateUserGroup(userGroup, findById(userGroup.getId())));
        userPermissionsReloader.reloadPermissions();
    }

    public void deleteUserGroup(Long id) {
        userGroupRepository.deleteById(id);
    }

    public boolean isUserGroupCodeUnique(Long id, String userGroupName) {
        return id == null
                ? userGroupRepository.findByCode(userGroupName) == null
                : userGroupRepository.findByCodeAndIdIsNot(userGroupName, id) == null;
    }
}
