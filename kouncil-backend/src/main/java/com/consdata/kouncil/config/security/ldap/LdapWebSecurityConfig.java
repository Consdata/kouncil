package com.consdata.kouncil.config.security.ldap;

import com.consdata.kouncil.security.UserRolesMapping;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@EnableWebSecurity
@Configuration
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ldap")
public class LdapWebSecurityConfig {

    private final UserRolesMapping userRolesMapping;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()).and()
                .cors().configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();
                    configuration.setAllowedOrigins(List.of("*"));
                    configuration.setAllowedMethods(List.of("*"));
                    configuration.setAllowedHeaders(List.of("*"));

                    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                    source.registerCorsConfiguration("/**", configuration);
                    return configuration;
                })
                .and()
                .authorizeRequests()
                .antMatchers("/api/info/version", "/api/login", "/api/activeProvider", "/*", "/assets/**").permitAll()
                .anyRequest().authenticated();
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .build();
    }

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

    @Value("${kouncil.auth.ldap.group-search-base:}")
    private String groupSearchBase;

    @Value("${kouncil.auth.ldap.group-search-filter:}")
    private String groupSearchFilter;

    @Value("${kouncil.auth.ldap.group-role-attribute:}")
    private String groupRoleAttribute;

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

        CustomLdapAuthoritiesPopulator ldapAuthoritiesPopulator = new CustomLdapAuthoritiesPopulator(ldapContextSource);
        ldapAuthoritiesPopulator.setSearchBase(groupSearchBase);
        ldapAuthoritiesPopulator.setSearchFilter(groupSearchFilter);
        ldapAuthoritiesPopulator.setRoleAttribute(groupRoleAttribute);

        LdapAuthenticationProvider ldapAuthenticationProvider = new LdapAuthenticationProvider(bindAuthenticator, ldapAuthoritiesPopulator);
        ldapAuthenticationProvider.setUserDetailsContextMapper(new KouncilLdapUserDetailsMapper(userRolesMapping));
        return ldapAuthenticationProvider;
    }
}
