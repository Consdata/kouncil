package com.consdata.kouncil.config.security.inmemory;

import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_DEFAULT_PASSWORD;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_DEFAULT_PASSWORD;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_DEFAULT_PASSWORD;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_DEFAULT_GROUP;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_DEFAULT_PASSWORD;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_USERNAME;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.security.SpaCsrfTokenRequestHandler;
import com.consdata.kouncil.security.UserRolesMapping;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@EnableWebSecurity
@Configuration
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
@DependsOn({"userGroupsConfigReader"})
public class InMemoryWebSecurityConfig {

    private final UserRolesMapping userRolesMapping;

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
                        .requestMatchers("/api/info/version", "/api/firstTimeLogin", "/api/login", "/api/activeProvider", "/api/context-path", "/*",
                                "/assets/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    @Bean
    GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults(""); // Remove the ROLE_ prefix
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .build();
    }

    @Bean
    @ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
    public UserDetailsManager userDetailsService() {
        log.info("Initializing inmemory authentication");
        return new InMemoryUserDetailsManager(
                createUser(ADMIN_CONFIG, ADMIN_USERNAME, ADMIN_DEFAULT_PASSWORD, ADMIN_DEFAULT_GROUP),
                createUser(EDITOR_CONFIG, EDITOR_USERNAME, EDITOR_DEFAULT_PASSWORD, EDITOR_DEFAULT_GROUP),
                createUser(VIEWER_CONFIG, VIEWER_USERNAME, VIEWER_DEFAULT_PASSWORD, VIEWER_DEFAULT_GROUP),
                createUser(SUPERUSER_CONFIG, SUPERUSER_USERNAME, SUPERUSER_DEFAULT_PASSWORD, SUPERUSER_DEFAULT_GROUP)
        );
    }

    private UserDetails createUser(String configFile, String username, String defaultPassword, String defaultRole) {
        log.info("Create user {} with default role {}", username, defaultRole);
        Path path = Paths.get(configFile);
        String password = defaultPassword;
        String[] role = defaultRole.split(",");

        if (Files.exists(path)) {
            try {
                String fileConfigData = Files.readString(path);
                String[] config = fileConfigData.split(";");
                if (config.length < 2) {
                    log.warn("Old configuration file found for user: {}. Removing old configuration.", username);
                    Files.delete(path);
                } else {
                    if (StringUtils.isNotEmpty(config[0])) {
                        password = config[0];
                    }
                    if (StringUtils.isNotEmpty(config[1])) {
                        role = config[1].split(",");
                    }
                }
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }
        }

        Set<GrantedAuthority> roles = userRolesMapping.mapToKouncilRoles(Set.of(role));

        return User.withUsername(username)
                .password(String.format("{noop}%s", password))
                .authorities(roles)
                .build();
    }
}
