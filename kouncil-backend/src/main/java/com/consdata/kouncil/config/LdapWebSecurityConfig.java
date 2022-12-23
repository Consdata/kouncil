package com.consdata.kouncil.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;

@Configuration
@Slf4j
public class LdapWebSecurityConfig {

    @Value("${kouncil.auth.ldap.provider-url:}")
    private String providerUrl;

    @Value("${kouncil.auth.ldap.technical-user-name:}")
    private String technicalUserName;

    @Value("${kouncil.auth.ldap.technical-user-password:}")
    private String technicalUserPassword;

    @Value("${kouncil.auth.ldap.search-base:}")
    private String searchBase;

    @Value("${kouncil.auth.ldap.search-filter:}")
    private String searchFilter;

    @Bean
    @ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ldap")
    public AuthenticationProvider ldapAuthenticationProvider() {
        log.info("Initializing ldap authentication");
        LdapContextSource ldapContextSource = new DefaultSpringSecurityContextSource(providerUrl);
        ldapContextSource.setUserDn(technicalUserName);
        ldapContextSource.setPassword(technicalUserPassword);
        ldapContextSource.setReferral("follow");
        ldapContextSource.setCacheEnvironmentProperties(true);
        ldapContextSource.setAnonymousReadOnly(false);
        ldapContextSource.setPooled(true);
        ldapContextSource.afterPropertiesSet();
        var userSearch = new FilterBasedLdapUserSearch(searchBase, searchFilter, ldapContextSource);
        userSearch.setSearchSubtree(true);
        var bindAuthenticator = new BindAuthenticator(ldapContextSource);
        bindAuthenticator.setUserSearch(userSearch);
        bindAuthenticator.afterPropertiesSet();
        return new LdapAuthenticationProvider(bindAuthenticator);
    }
}
