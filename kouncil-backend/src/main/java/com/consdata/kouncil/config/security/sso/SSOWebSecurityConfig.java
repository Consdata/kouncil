package com.consdata.kouncil.config.security.sso;

import com.consdata.kouncil.config.security.DefaultUserPermissionsReloader;
import com.consdata.kouncil.notifications.NotificationService;
import com.consdata.kouncil.config.security.SpaCsrfTokenRequestHandler;
import com.consdata.kouncil.security.UserRolesMapping;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@EnableWebSecurity
@Configuration
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "sso")
public class SSOWebSecurityConfig {

    private final ObjectMapper mapper;
    private final UserRolesMapping userRolesMapping;
    private final NotificationService notificationService;
    private final CustomOAuth2UserService customUserService;

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
                        .requestMatchers("/api/info/version", "/api/login", "/oauth2/**", "/api/sso-providers", "/api/active-provider", "/api/context-path",
                                "/api/permissions-not-defined", "/api/create-temporary-admin", "/*", "/assets/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authEndpoint -> authEndpoint.authorizationRequestRepository(new InMemoryAuthRepository()))
                        .userInfoEndpoint(userInfo -> userInfo.userService(customUserService).userAuthoritiesMapper(this.authoritiesMapper()))
                        .successHandler((HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) -> {})
                )
                .exceptionHandling(handling -> handling.authenticationEntryPoint(this::authenticationEntryPoint));

        return http.build();
    }

    @Bean
    public DefaultUserPermissionsReloader userPermissionsReloader() {
        return new DefaultUserPermissionsReloader(notificationService);
    }

    private GrantedAuthoritiesMapper authoritiesMapper() {
        return authorities -> {
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();
            authorities.forEach(authority -> {
                if (authority instanceof OidcUserAuthority) {
                    List<String> groups = (List<String>) ((OidcUserAuthority) authority).getAttributes().get("groups");
                    mappedAuthorities.addAll(userRolesMapping.mapToKouncilRoles(new HashSet<>(groups)));
                } else if (authority instanceof OAuth2UserAuthority oauth2UserAuthority) {
                    mappedAuthorities.addAll(userRolesMapping.mapToKouncilRoles(Set.of(oauth2UserAuthority.getAuthority())));
                } else if (authority instanceof SimpleGrantedAuthority simpleGrantedAuthority) {
                    mappedAuthorities.addAll(userRolesMapping.mapToKouncilRoles(Set.of(simpleGrantedAuthority.getAuthority())));
                }
            });
            return mappedAuthorities;
        };
    }

    private void authenticationEntryPoint(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, AuthenticationException e)
            throws IOException {
        httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpServletResponse.getWriter().write(mapper.writeValueAsString(Collections.singletonMap("error", "Unauthenticated")));
    }
}
