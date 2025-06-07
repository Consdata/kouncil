package com.consdata.kouncil.security;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    @Value("${kouncil.auth.active-provider}")
    private String activeProvider;

    @GetMapping("/activeProvider")
    public String activeProvider() {
        return activeProvider;
    }

    @PostMapping("/login")
    public boolean login(HttpServletRequest req, @RequestBody User user) {
        return authService.login(req, user);
    }

    @GetMapping("/logout")
    public void logout(HttpServletRequest req) throws ServletException {
        authService.logout(req);
    }

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/userRoles")
    public Set<String> getUserRoles() {
        return authService.getUserRoles();
    }

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/installationId")
    public String getInstallationId() throws IOException {
        return authService.getInstallationId();
    }
}
