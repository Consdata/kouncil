package com.consdata.kouncil.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "ldap")
public class LdapUserManager implements UserManager {

    @Override
    public boolean firstTimeLogin() {
        return false;
    }
}
