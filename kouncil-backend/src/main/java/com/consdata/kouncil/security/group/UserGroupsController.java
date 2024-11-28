package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-groups")
public class UserGroupsController {

    private final UserGroupsService userGroupsService;

    @RolesAllowed({SystemFunctionNameConstants.USER_GROUPS, SystemFunctionNameConstants.USER_GROUPS_LIST})
    @GetMapping
    public List<UserGroupDto> getUserGroups() {
        return userGroupsService.getUserGroups();
    }

    @RolesAllowed(SystemFunctionNameConstants.USER_GROUPS)
    @PostMapping
    public void updatePermissions(@RequestBody List<UserGroupDto> userGroupDtoList) {
        userGroupsService.saveAll(userGroupDtoList);
    }
}
