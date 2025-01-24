package com.consdata.kouncil.security.group;

import com.consdata.kouncil.config.security.UserPermissionsReloader;
import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.model.admin.SystemFunctionName;
import com.consdata.kouncil.security.FirstTimeApplicationLaunchService;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
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
    private final SystemFunctionsRepository systemFunctionsRepository;
    private final FirstTimeApplicationLaunchService firstAppLaunchService;

    public List<UserGroupDto> getUserGroups() {
        return StreamSupport.stream(userGroupRepository.findAll().spliterator(), false)
                .map(UserGroupConverter::convertToUserGroupDto)
                .toList();
    }

    public void saveAll(List<UserGroupDto> userGroupDtoList) {
        SystemFunction loginFunction = systemFunctionsRepository.findByName(SystemFunctionName.LOGIN);

        userGroupRepository.saveAll(userGroupDtoList
                .stream()
                .map(UserGroupConverter::convertToUserGroup)
                .map(ug -> {
                    if (ug.getFunctions().stream().noneMatch(fn -> fn.getName().equals(SystemFunctionName.LOGIN))) {
                        ug.getFunctions().add(loginFunction);
                    }
                    return ug;
                }).toList());

        if (!firstAppLaunchService.isTemporaryAdminLoggedIn()) {
            userPermissionsReloader.reloadPermissions(true);
        }
    }
}
