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

import com.consdata.kouncil.config.security.UserManager;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class InMemoryUserManager implements UserManager {

    private final UserDetailsManager userDetailsManager;

    public boolean firstTimeLogin(String username) {
        Path path;
        switch (username) {
            case ADMIN_USERNAME -> path = Paths.get(ADMIN_CONFIG);
            case EDITOR_USERNAME -> path = Paths.get(EDITOR_CONFIG);
            case VIEWER_USERNAME -> path = Paths.get(VIEWER_CONFIG);
            case SUPERUSER_USERNAME -> path = Paths.get(SUPERUSER_CONFIG);
            default -> throw new IllegalStateException(String.format("Can't find user: %s", SecurityContextHolder.getContext().getAuthentication().getName()));
        }

        return !Files.exists(path);
    }

    @Override
    public void skipChangeDefaultPassword() throws IOException {
        Path path;
        byte[] strToBytes;
        switch (SecurityContextHolder.getContext().getAuthentication().getName()) {
            case ADMIN_USERNAME -> {
                path = Paths.get(ADMIN_CONFIG);
                strToBytes = generateFileData(ADMIN_DEFAULT_PASSWORD, ADMIN_DEFAULT_GROUP);
            }
            case EDITOR_USERNAME -> {
                path = Paths.get(EDITOR_CONFIG);
                strToBytes = generateFileData(EDITOR_DEFAULT_PASSWORD, EDITOR_DEFAULT_GROUP);
            }
            case VIEWER_USERNAME -> {
                path = Paths.get(VIEWER_CONFIG);
                strToBytes = generateFileData(VIEWER_DEFAULT_PASSWORD, VIEWER_DEFAULT_GROUP);
            }
            case SUPERUSER_USERNAME -> {
                path = Paths.get(SUPERUSER_CONFIG);
                strToBytes = generateFileData(SUPERUSER_DEFAULT_PASSWORD, SUPERUSER_DEFAULT_GROUP);
            }
            default -> throw new IllegalStateException(
                    String.format("Can't skip change password for %s", SecurityContextHolder.getContext().getAuthentication().getName()));
        }

        Files.write(path, strToBytes);
    }

    @Override
    public void changeDefaultPassword(String password) throws IOException {
        Path path;
        String oldPassword;
        byte[] strToBytes;

        switch (SecurityContextHolder.getContext().getAuthentication().getName()) {
            case ADMIN_USERNAME -> {
                path = Paths.get(ADMIN_CONFIG);
                oldPassword = getUserOldPassword(path, ADMIN_DEFAULT_PASSWORD);
                strToBytes = generateFileData(password, ADMIN_DEFAULT_GROUP);
            }
            case EDITOR_USERNAME -> {
                path = Paths.get(EDITOR_CONFIG);
                oldPassword = getUserOldPassword(path, EDITOR_DEFAULT_PASSWORD);
                strToBytes = generateFileData(password, EDITOR_DEFAULT_GROUP);
            }
            case VIEWER_USERNAME -> {
                path = Paths.get(VIEWER_CONFIG);
                oldPassword = getUserOldPassword(path, VIEWER_DEFAULT_PASSWORD);
                strToBytes = generateFileData(password, VIEWER_DEFAULT_GROUP);
            }
            case SUPERUSER_USERNAME -> {
                path = Paths.get(SUPERUSER_CONFIG);
                oldPassword = getUserOldPassword(path, SUPERUSER_DEFAULT_PASSWORD);
                strToBytes = generateFileData(password, SUPERUSER_DEFAULT_GROUP);
            }
            default -> throw new IllegalStateException(
                    String.format("Can't change default password for %s", SecurityContextHolder.getContext().getAuthentication().getName()));
        }

        this.userDetailsManager.changePassword(oldPassword, String.format("{noop}%s", password));
        Files.write(path, strToBytes);
    }

    private byte[] generateFileData(String defaultPassword, String defaultRole) {
        return String.format("%s;%s", defaultPassword, defaultRole).getBytes();
    }

    private String getUserOldPassword(Path path, String defaultPassword) throws IOException {
        return Files.exists(path) ? Files.readString(path).split(";")[0] : defaultPassword;
    }

}
