package com.consdata.kouncil.security;

import static com.consdata.kouncil.config.KouncilConfiguration.INSTALLATION_ID_FILE;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import jakarta.annotation.Resource;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Resource(name = "authenticationManager")
    private AuthenticationManager authManager;

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

    public void logout(HttpServletRequest req) throws ServletException {
        req.logout();
    }

    public Set<String> getUserRoles() {
        Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext().getAuthentication().getAuthorities();
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());
    }

    public String getInstallationId() throws IOException {
        return Files.readString(Path.of(INSTALLATION_ID_FILE));
    }
}
