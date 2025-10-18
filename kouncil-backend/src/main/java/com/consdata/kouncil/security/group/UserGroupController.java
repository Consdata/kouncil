package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import jakarta.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-group")
public class UserGroupController {

    private final UserGroupService userGroupService;

    @RolesAllowed(SystemFunctionNameConstants.USER_GROUP_UPDATE)
    @GetMapping(path = "/{id}")
    public UserGroupDto getUserGroup(@PathVariable("id") Long id) {
        return userGroupService.getUserGroup(id);
    }

    @RolesAllowed(SystemFunctionNameConstants.USER_GROUP_CREATE)
    @PostMapping
    public void createUserGroup(@RequestBody UserGroupDto userGroup) {
        userGroupService.createUserGroup(userGroup);
    }

    @RolesAllowed(SystemFunctionNameConstants.USER_GROUP_UPDATE)
    @PutMapping
    public void updateUserGroup(@RequestBody UserGroupDto userGroup) {
        userGroupService.updateUserGroup(userGroup);
    }

    @RolesAllowed(SystemFunctionNameConstants.USER_GROUP_DELETE)
    @DeleteMapping(path = "/{id}")
    public void deleteUserGroup(@PathVariable("id") Long id) {
        userGroupService.deleteUserGroup(id);
    }

    @RolesAllowed({SystemFunctionNameConstants.USER_GROUP_CREATE, SystemFunctionNameConstants.USER_GROUP_UPDATE})
    @PostMapping(path = "/is-user-group-code-unique")
    public boolean isUserGroupCodeUnique(@RequestBody UserGroupDto userGroupDto) {
        return userGroupService.isUserGroupCodeUnique(userGroupDto.getId(), userGroupDto.getCode());
    }
}
