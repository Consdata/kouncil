package com.consdata.kouncil.security;

import com.consdata.kouncil.model.admin.Function;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.function.FunctionsRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRolesMapping {

    private final FunctionsRepository functionsRepository;

    public Set<GrantedAuthority> mapToKouncilRoles(Set<String> userRoles) {
        Set<GrantedAuthority> collect = new HashSet<>();

        List<Function> functions = StreamSupport.stream(functionsRepository.findAll().spliterator(), false).toList();

        userRoles.forEach(userRole -> functions.forEach(function -> {
            List<String> list = function.getUserGroups().stream().map(UserGroup::getName).toList();
            if (list.contains(userRole)) {
                collect.add(new SimpleGrantedAuthority(function.getName().name()));
            }
        }));
        log.info("User roles: {}", collect);
        return collect;
    }
}
