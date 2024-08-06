package com.consdata.kouncil.security;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.function.SystemFunctionsRepository;
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

    private final SystemFunctionsRepository systemFunctionsRepository;

    public Set<GrantedAuthority> mapToKouncilRoles(Set<String> userRoles) {
        Set<GrantedAuthority> collect = new HashSet<>();

        List<SystemFunction> systemFunctions = StreamSupport.stream(systemFunctionsRepository.findAll().spliterator(), false).toList();

        userRoles.forEach(userRole -> systemFunctions.forEach(systemFunction -> {
            List<String> list = systemFunction.getUserGroups().stream().map(UserGroup::getName).toList();
            if (list.contains(userRole)) {
                collect.add(new SimpleGrantedAuthority(systemFunction.getName().name()));
            }
        }));
        log.info("User roles: {}", collect);
        return collect;
    }
}
