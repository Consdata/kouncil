package com.consdata.kouncil.config.security.ldap;

import static org.apache.commons.lang3.StringUtils.isEmpty;

import com.consdata.kouncil.config.security.KouncilUserDetails;
import com.consdata.kouncil.security.UserRolesMapping;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;

@RequiredArgsConstructor
public class KouncilLdapUserDetailsMapper extends LdapUserDetailsMapper {

    private final UserRolesMapping userRolesMapping;

    @Override
    public UserDetails mapUserFromContext(final DirContextOperations ctx, final String fullUsername, final Collection<? extends GrantedAuthority> authorities) {
        final String username = removeDomain(fullUsername);
        final UserDetails ldapBasedUserDetails = super.mapUserFromContext(ctx, username, authorities);
        Set<String> ldapGroups = authorities
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        Set<GrantedAuthority> grantedAuthorities = userRolesMapping.mapToKouncilRoles(ldapGroups);
        return new KouncilUserDetails(ldapBasedUserDetails.getUsername(), grantedAuthorities);
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
