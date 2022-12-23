package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class KouncilConfigurationController {

    private final KouncilConfiguration kouncilConfiguration;
    private final Environment env;

    @GetMapping("/connection")
    @EntryExitLogger
    public Map<String, String> getAllConnections() {
        return kouncilConfiguration
                .getClusterConfig()
                .entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry
                                .getValue()
                                .getBrokers()
                                .stream()
                                .findFirst()
                                .map(BrokerConfig::getAddress)
                                .orElseThrow(() -> new KouncilRuntimeException("Broker not found"))
                ));
    }

    @GetMapping("/ssoproviders")
    public List<String> getAllAvailableSSOProviders() {
        List<String> availableProviders = new ArrayList<>();
        String providers = env.getProperty("kouncil.auth.sso.supported.providers");
        if (providers != null) {
            Arrays.stream(providers.split(",")).forEach(provider -> {
                if (env.getProperty(String.format("spring.security.oauth2.client.registration.%s.client-id", provider)) != null) {
                    availableProviders.add(provider);
                }
            });
        }

        return availableProviders;
    }
}
