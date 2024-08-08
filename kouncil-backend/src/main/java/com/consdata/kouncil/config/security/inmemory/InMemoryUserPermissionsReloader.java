package com.consdata.kouncil.config.security.inmemory;

import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.EDITOR_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.SUPERUSER_USERNAME;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_CONFIG;
import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.VIEWER_USERNAME;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.security.DefaultUserPermissionsReloader;
import com.consdata.kouncil.security.UserRolesMapping;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class InMemoryUserPermissionsReloader extends DefaultUserPermissionsReloader {

    private final UserDetailsManager userDetailsService;
    private final UserRolesMapping userRolesMapping;

    public InMemoryUserPermissionsReloader(SimpMessagingTemplate eventSender, UserDetailsManager userDetailsService,
            UserRolesMapping userRolesMapping) {
        super(eventSender);
        this.userDetailsService = userDetailsService;
        this.userRolesMapping = userRolesMapping;
    }

    @Override
    public void reloadPermissions() {
        super.reloadPermissions();
        List.of(ADMIN_USERNAME, EDITOR_USERNAME, VIEWER_USERNAME, SUPERUSER_USERNAME).forEach(user -> {
            try {
                String[] fileContent = Files.readString(getPath(user)).split(";");
                userDetailsService.updateUser(User.withUsername(user)
                        .password(String.format("{noop}%s", fileContent[0]))
                        .authorities(userRolesMapping.mapToKouncilRoles(Set.of(fileContent[1].split(","))))
                        .build());
            } catch (IOException e) {
                throw new KouncilRuntimeException(e);
            }
        });
    }

    private Path getPath(String username) {
        return switch (username) {
            case ADMIN_USERNAME -> Paths.get(ADMIN_CONFIG);
            case EDITOR_USERNAME -> Paths.get(EDITOR_CONFIG);
            case VIEWER_USERNAME -> Paths.get(VIEWER_CONFIG);
            case SUPERUSER_USERNAME -> Paths.get(SUPERUSER_CONFIG);
            default -> throw new IllegalStateException(String.format("Can't find user: %s", SecurityContextHolder.getContext().getAuthentication().getName()));
        };
    }
}
