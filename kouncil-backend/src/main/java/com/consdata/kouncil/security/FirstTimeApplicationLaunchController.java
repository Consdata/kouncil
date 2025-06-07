package com.consdata.kouncil.security;

import com.consdata.kouncil.security.group.UserGroupsService;
import com.consdata.kouncil.security.group.dto.UserGroupDto;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class FirstTimeApplicationLaunchController {

    private final UserGroupsService userGroupsService;
    private final FirstTimeApplicationLaunchService firstTimeApplicationLaunchService;

    @GetMapping(path = "/permissions-not-defined")
    public boolean permissionsNotDefined() {
        List<UserGroupDto> userGroups = userGroupsService.getUserGroups();
        return userGroups.isEmpty() || userGroups.stream().allMatch(ug -> ug.getFunctions().isEmpty());
    }

    @PostMapping(path = "/create-temporary-admin")
    public void createTempUser(HttpServletRequest request) {
        firstTimeApplicationLaunchService.createTemporaryAdmin(request);
    }

    @DeleteMapping("/delete-temporary-admin")
    public void deleteTempUser(HttpServletRequest req) throws ServletException {
        firstTimeApplicationLaunchService.deleteTemporaryAdminUser(req);
    }
}
