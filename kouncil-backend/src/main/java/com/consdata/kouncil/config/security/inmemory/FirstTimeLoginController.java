package com.consdata.kouncil.config.security.inmemory;

import com.consdata.kouncil.config.security.UserManager;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class FirstTimeLoginController {

    private final UserManager defaultUserManager;

    @GetMapping("/api/firstTimeLogin/{username}")
    public boolean firstTimeLogin(@PathVariable("username") String username) {
        return defaultUserManager.firstTimeLogin(username);
    }

    @GetMapping("/api/skipChangeDefaultPassword")
    public void skipChangeDefaultPassword() throws IOException {
        defaultUserManager.skipChangeDefaultPassword();
    }

    @PostMapping("/api/changeDefaultPassword")
    public void changeDefaultPassword(@RequestBody String password) throws IOException {
        defaultUserManager.changeDefaultPassword(password);
    }
}
