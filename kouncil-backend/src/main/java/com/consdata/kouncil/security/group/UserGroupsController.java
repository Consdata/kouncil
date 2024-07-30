package com.consdata.kouncil.security.group;

import com.consdata.kouncil.model.admin.FunctionName.Fields;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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
}
