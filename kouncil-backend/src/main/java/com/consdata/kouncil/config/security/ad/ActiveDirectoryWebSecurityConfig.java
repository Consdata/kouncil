package com.consdata.kouncil.config.security.ad;

import com.consdata.kouncil.config.security.DefaultUserPermissionsReloader;
import com.consdata.kouncil.config.security.SpaCsrfTokenRequestHandler;
import com.consdata.kouncil.security.UserRolesMapping;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@EnableWebSecurity
@Configuration
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ad")
public class ActiveDirectoryWebSecurityConfig {

    private final UserRolesMapping userRolesMapping;
    private final SimpMessagingTemplate eventSender;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                )
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();
                    configuration.setAllowedOrigins(List.of("*"));
                    configuration.setAllowedMethods(List.of("*"));
                    configuration.setAllowedHeaders(List.of("*"));

                    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                    source.registerCorsConfiguration("/**", configuration);
                    return configuration;
                }))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/info/version", "/api/login", "/api/activeProvider", "/api/context-path", "/*", "/assets/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    @Bean
    GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults(""); // Remove the ROLE_ prefix
    }

    @Bean
    public DefaultUserPermissionsReloader userPermissionsReloader() {
        return new DefaultUserPermissionsReloader(eventSender);
    }

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
        provider.setUserDetailsContextMapper(new ActiveDirectoryUserDetailsMapper(userRolesMapping));
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .build();
    }
}
