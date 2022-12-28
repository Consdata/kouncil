package com.consdata.kouncil.config.security.ad;

import com.consdata.kouncil.config.security.UserManager;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ad")
public class ActiveDirectoryUserManager implements UserManager {

    @Override
    public boolean firstTimeLogin() {
        return false;
    }
}
