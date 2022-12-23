package com.consdata.kouncil.config.security.sso;

import com.consdata.kouncil.config.security.UserManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "sso")
public class SSOUserManager implements UserManager {

    public boolean firstTimeLogin() {
        return false;
    }
}
