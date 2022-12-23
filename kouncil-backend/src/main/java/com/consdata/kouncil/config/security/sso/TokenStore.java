package com.consdata.kouncil.config.security.sso;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class TokenStore {

    private final Map<String, Authentication> cache = new HashMap<>();

    public String generateToken(Authentication authentication) {
        String token = UUID.randomUUID().toString();
        cache.put(token, authentication);
        return token;
    }
}
