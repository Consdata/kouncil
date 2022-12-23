package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;

@Configuration
@Slf4j
public class InMemoryWebSecurity {
    @Bean
    @ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
    public UserDetailsManager userDetailsService() {
        log.info("Initializing inmemory authentication");
        Path path = Paths.get("default_user_password.txt");
        String adminPass = "admin";
        if (Files.exists(path)) {
            try {
                adminPass = Files.readString(path);
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }
        }

        UserDetails admin = User.withUsername("admin")
                .password(String.format("{noop}%s", adminPass))
                .authorities("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

}
