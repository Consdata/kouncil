package com.consdata.kouncil.security;

import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ldap")
public class LdapUserManager implements UserManager {

    @PostConstruct

    @Override
    public boolean firstTimeLogin() {
        return false;
    }
}
