package com.consdata.kouncil.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;

@Configuration
@Slf4j
public class ActiveDirectoryWebSecurityConfig {

    @Value("${kouncil.auth.ad.domain:}")
    public String domain;

    @Value("${kouncil.auth.ad.url:}")
    public String url;

    @Value("${kouncil.auth.ad.search-filter:}")
    public String searchFilter;

    @Bean
    @ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ad")
    public AuthenticationProvider activeDirectoryAuthenticationProvider() {
        log.info("Initializing ad authentication");
        var provider = new ActiveDirectoryLdapAuthenticationProvider(domain, url);
        provider.setConvertSubErrorCodesToExceptions(true);
        provider.setUseAuthenticationRequestCredentials(true);
        provider.setSearchFilter(searchFilter);
        return provider;
    }
}
