package com.consdata.kouncil.config.security;

import static org.apache.commons.lang3.StringUtils.isEmpty;

import com.consdata.kouncil.security.UserRolesMapping;
import java.util.Arrays;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;

@RequiredArgsConstructor
public class KouncilUserDetailsMapper extends LdapUserDetailsMapper {

    private final UserRolesMapping userRolesMapping;
    private static final String MEMBER_OF = "memberOf";
    private static final String CN = "CN=";

    @Override
    public UserDetails mapUserFromContext(final DirContextOperations ctx, final String fullUsername, final Collection<? extends GrantedAuthority> authorities) {
        final String username = removeDomain(fullUsername);
        final UserDetails ldapBasedUserDetails = super.mapUserFromContext(ctx, username, authorities);
        Set<String> ldapGroups = Arrays.stream(ctx.getObjectAttributes(MEMBER_OF))
                .map(this::getLdapGroups)
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());
        Set<GrantedAuthority> grantedAuthorities = userRolesMapping.mapToKouncilRoles(ldapGroups);
        return new KouncilUserDetails(ldapBasedUserDetails.getUsername(), grantedAuthorities);
    }

    private Set<String> getLdapGroups(Object attributes) {
        Object[] memberOf = attributes.toString().split(",");
        return Arrays
                .stream(memberOf)
                .map(Object::toString)
                .filter(element -> element.contains(CN))
                .map(element -> element.replace(CN, ""))
                .collect(Collectors.toSet());
    }

    public static String removeDomain(final String username) {
        if (isEmpty(username)) {
            return username;
        }
        if (username.contains("@")) {
            return username.substring(0, username.lastIndexOf('@'));
        }

        return username;
    }
}
