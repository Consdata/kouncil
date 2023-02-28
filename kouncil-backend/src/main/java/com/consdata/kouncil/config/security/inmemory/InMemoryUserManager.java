package com.consdata.kouncil.config.security.inmemory;

import static com.consdata.kouncil.config.security.inmemory.InMemoryConst.ADMIN_CONFIG;

import com.consdata.kouncil.config.security.UserManager;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class InMemoryUserManager implements UserManager {

    private final UserDetailsManager userDetailsManager;

    public boolean firstTimeLogin() {
        Path path = Paths.get(ADMIN_CONFIG);
        return !Files.exists(path);
    }

    @Override
    public void skipChangeDefaultPassword() throws IOException {
        Path path = Paths.get(ADMIN_CONFIG);
        byte[] strToBytes = "admin".getBytes();
        Files.write(path, strToBytes);
    }

    @Override
    public void changeDefaultPassword(@RequestBody String password) throws IOException {
        Path path = Paths.get(ADMIN_CONFIG);
        String oldPassword;
        if (!Files.exists(path)) {
            oldPassword = "admin";
        } else {
            oldPassword = Files.readString(path);
        }
        this.userDetailsManager.changePassword(oldPassword, String.format("{noop}%s", password));
        byte[] strToBytes = password.getBytes();
        Files.write(path, strToBytes);
    }

}
