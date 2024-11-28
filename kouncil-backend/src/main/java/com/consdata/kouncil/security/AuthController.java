package com.consdata.kouncil.security;

import static com.consdata.kouncil.config.KouncilConfiguration.INSTALLATION_ID_FILE;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import javax.annotation.security.RolesAllowed;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    @Resource(name = "authenticationManager")
    private AuthenticationManager authManager;

    @Value("${kouncil.auth.active-provider}")
    private String activeProvider;

    @GetMapping("/api/activeProvider")
    public String activeProvider() {
        return activeProvider;
    }

    @PostMapping("/api/login")
    public boolean login(HttpServletRequest req, @RequestBody User user) {
        UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());
        Authentication auth = authManager.authenticate(authReq);

        SecurityContext sc = SecurityContextHolder.getContext();
        sc.setAuthentication(auth);
        HttpSession session = req.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, sc);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        return currentPrincipalName != null && !currentPrincipalName.isEmpty();
    }

    @GetMapping("/api/logout")
    public void logout(HttpServletRequest req) throws ServletException {
        req.logout();
    }

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/api/userRoles")
    public Set<String> getUserRoles() {
        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
    }

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/api/installationId")
    public String getInstallationId() throws IOException {
        return Files.readString(Path.of(INSTALLATION_ID_FILE));
    }
}
