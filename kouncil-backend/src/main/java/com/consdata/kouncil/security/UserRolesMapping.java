package com.consdata.kouncil.security;

import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.security.group.UserGroupRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRolesMapping {

    private final UserGroupRepository groupRepository;

    public Set<GrantedAuthority> mapToKouncilRoles(Set<String> userRoles) {
        Set<GrantedAuthority> collect = new HashSet<>();

        List<UserGroup> userGroups = groupRepository.findAllByCodeIn(userRoles).stream().toList();

        userRoles.forEach(userRole -> userGroups
                .forEach(userGroup ->
                        collect.addAll(userGroup.getFunctions().stream().map(function -> new SimpleGrantedAuthority(function.getName().name())).toList())));
        log.info("User roles: {}", collect);
        return collect;
    }
}
