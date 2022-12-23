package com.consdata.kouncil.security;

import com.consdata.kouncil.config.security.UserManager;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FirstTimeLoginController {

    private final UserManager defaultUserManager;

    @GetMapping("/api/firstTimeLogin")
    public boolean firstTimeLogin() {
        return defaultUserManager.firstTimeLogin();
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
