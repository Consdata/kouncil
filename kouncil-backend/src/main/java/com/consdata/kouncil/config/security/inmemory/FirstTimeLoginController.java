package com.consdata.kouncil.config.security.inmemory;

import com.consdata.kouncil.config.security.UserManager;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class FirstTimeLoginController {

    private final UserManager defaultUserManager;

    @GetMapping("/first-time-login/{username}")
    public boolean firstTimeLogin(@PathVariable("username") String username) {
        return defaultUserManager.firstTimeLogin(username);
    }

    @GetMapping("/skip-change-default-password")
    public void skipChangeDefaultPassword() throws IOException {
        defaultUserManager.skipChangeDefaultPassword();
    }

    @PostMapping("/change-default-password")
    public void changeDefaultPassword(@RequestBody String password) throws IOException {
        defaultUserManager.changeDefaultPassword(password);
    }
}
