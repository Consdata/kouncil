package com.consdata.kouncil.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("default")
@RequiredArgsConstructor
public class DefaultUserManagerImpl implements UserManager {

    @Override
    public boolean firstTimeLogin() {
        return false;
    }
}
