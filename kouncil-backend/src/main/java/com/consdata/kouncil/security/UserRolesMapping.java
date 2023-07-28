package com.consdata.kouncil.security;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class UserRolesMapping {

    private static final String VALUES_SEPARATOR = ";";

    @Value("${kouncil.authorization.role-admin:}")
    private String adminRoles;
    @Value("${kouncil.authorization.role-editor:}")
    private String editorRoles;
    @Value("${kouncil.authorization.role-viewer:}")
    private String viewerRoles;

    private final Map<KouncilRole, Set<String>> roleMapping = new HashMap<>();

    @PostConstruct
    public void init() {
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_ADMIN, new HashSet<>(Arrays.asList(adminRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_EDITOR, new HashSet<>(Arrays.asList(editorRoles.split(VALUES_SEPARATOR))));
        roleMapping.put(KouncilRole.ROLE_KOUNCIL_VIEWER, new HashSet<>(Arrays.asList(viewerRoles.split(VALUES_SEPARATOR))));
        log.info("Role mapping loaded: {}", roleMapping);
    }

    public Set<GrantedAuthority> mapToKouncilRoles(Set<String> userRoles) {
        Set<GrantedAuthority> collect = new HashSet<>();
        userRoles.forEach(userRole -> roleMapping.forEach((key, value) -> {
            if (value.contains(userRole)) {
                collect.add(new SimpleGrantedAuthority(key.name()));
            }
        }));
        log.info("User roles: {}", collect);
        return collect;
    }
}
