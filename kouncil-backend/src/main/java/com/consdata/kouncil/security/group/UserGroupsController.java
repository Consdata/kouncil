package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import jakarta.annotation.security.RolesAllowed;
import java.util.List;
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

    @RolesAllowed(Fields.USER_GROUPS)
    @GetMapping
    public List<UserGroupDto> getUserGroups() {
        return userGroupsService.getUserGroups();
    }

    @RolesAllowed(Fields.USER_GROUPS)
    @PostMapping
    public void updatePermissions(@RequestBody List<UserGroupDto> userGroupDtoList) {
        userGroupsService.saveAll(userGroupDtoList);
    }
}
