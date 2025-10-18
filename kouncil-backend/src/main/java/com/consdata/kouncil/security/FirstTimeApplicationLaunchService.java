package com.consdata.kouncil.security;

import com.consdata.kouncil.config.security.UserPermissionsReloader;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import java.util.ArrayList;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FirstTimeApplicationLaunchService {

    private final UserDetailsManager userDetailsManager;
    private static final String TEMPORARY_ADMIN_USER = "temporary_admin";
    private static final String TEMPORARY_ADMIN_USER_PASSWORD = "temporary_admin";
    private final AuthService authService;
    private final UserPermissionsReloader userPermissionsReloader;

    public void createTemporaryAdmin(HttpServletRequest request) {
        if (!userDetailsManager.userExists(TEMPORARY_ADMIN_USER)) {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(SystemFunctionNameConstants.LOGIN));
            authorities.add(new SimpleGrantedAuthority(SystemFunctionNameConstants.USER_GROUPS));
            authorities.add(new SimpleGrantedAuthority(SystemFunctionNameConstants.USER_GROUP_CREATE));
            authorities.add(new SimpleGrantedAuthority(SystemFunctionNameConstants.USER_GROUP_UPDATE));
            authorities.add(new SimpleGrantedAuthority(SystemFunctionNameConstants.USER_GROUPS_LIST));

            UserDetails admin = org.springframework.security.core.userdetails.User.withUsername(TEMPORARY_ADMIN_USER)
                    .password(String.format("{noop}%s", TEMPORARY_ADMIN_USER_PASSWORD))
                    .authorities(authorities)
                    .build();

            userDetailsManager.createUser(admin);
        }

        authService.login(request, new User(TEMPORARY_ADMIN_USER, TEMPORARY_ADMIN_USER_PASSWORD));
    }

    public void deleteTemporaryAdminUser(HttpServletRequest req) throws ServletException {
        userDetailsManager.deleteUser(TEMPORARY_ADMIN_USER);
        userPermissionsReloader.reloadPermissions(false);
        authService.logout(req);
    }

    public boolean isTemporaryAdminLoggedIn() {
        return TEMPORARY_ADMIN_USER.equals(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
