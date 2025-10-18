package com.consdata.kouncil.config.security.ldap;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Data;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.ldap.SpringSecurityLdapTemplate;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;

@Data
public class CustomLdapAuthoritiesPopulator implements LdapAuthoritiesPopulator {

    private final SpringSecurityLdapTemplate ldapTemplate;

    private String searchBase;
    private String searchFilter;
    private String roleAttribute;
    private static final String CN = "CN=";

    public CustomLdapAuthoritiesPopulator(LdapContextSource ldapContextSource) {
        this.ldapTemplate = new SpringSecurityLdapTemplate(ldapContextSource);
    }

    @Override
    public Collection<? extends GrantedAuthority> getGrantedAuthorities(DirContextOperations userData, String username) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        Set<Map<String, List<String>>> userRoles = this.ldapTemplate
                .searchForMultipleAttributeValues(searchBase, searchFilter, new String[]{username}, new String[]{roleAttribute});

        for (Map<String, List<String>> role : userRoles) {
            authorities.addAll(mapRole(role));
        }
        return authorities;
    }

    private Set<GrantedAuthority> mapRole(Map<String, List<String>> ldapGroup) {
        return ldapGroup.get(roleAttribute).stream().map(role -> new SimpleGrantedAuthority(extractRole(role))).collect(Collectors.toSet());
    }

    private String extractRole(String fullRole) {
        String role = fullRole;
        if (fullRole.contains(",")) {
            role = Arrays
                    .stream(fullRole.split(","))
                    .filter(element -> element.contains(CN))
                    .map(element -> element.replace(CN, ""))
                    .findFirst()
                    .orElse(null);
        }
        return role;
    }
}
