package com.consdata.kouncil.config.security.sso;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "sso")
public class SSOProvidersController {

    private final Environment env;

    @Value("${kouncil.auth.sso.supported.providers}")
    private List<String> providers;

    @GetMapping("/sso-providers")
    public List<String> getAllAvailableSSOProviders() {
        List<String> availableProviders = new ArrayList<>();
        if (providers != null) {
            providers.forEach(provider -> {
                if (env.getProperty(String.format("spring.security.oauth2.client.registration.%s.client-id", provider)) != null) {
                    availableProviders.add(provider);
                }
            });
        }

        return availableProviders;
    }
}
