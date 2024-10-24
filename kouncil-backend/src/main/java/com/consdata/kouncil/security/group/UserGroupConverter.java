package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.function.SystemFunctionConverter;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class UserGroupConverter {

    public static UserGroupDto convertToUserGroupDto(UserGroup userGroup) {
        UserGroupDto userGroupDto = new UserGroupDto();
        userGroupDto.setId(userGroup.getId());
        userGroupDto.setCode(userGroup.getCode());
        userGroupDto.setName(userGroup.getName());
        userGroupDto.setFunctions(userGroup.getFunctions().stream().map(SystemFunctionConverter::convertToFunctionDto).collect(Collectors.toSet()));
        return userGroupDto;
    }

    public static UserGroup convertToUserGroup(UserGroupDto userGroupDto) {
        UserGroup userGroup = updateUserGroup(userGroupDto, new UserGroup());
        userGroup.setFunctions(userGroupDto.getFunctions().stream().map(SystemFunctionConverter::convertToFunction).collect(Collectors.toSet()));
        return userGroup;
    }

    public static UserGroup updateUserGroup(UserGroupDto userGroupDto, UserGroup userGroup) {
        userGroup.setId(userGroupDto.getId());
        userGroup.setCode(userGroupDto.getCode());
        userGroup.setName(userGroupDto.getName());
        return userGroup;
    }
}
