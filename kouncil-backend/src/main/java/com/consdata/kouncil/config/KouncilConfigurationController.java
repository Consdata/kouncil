package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/connection")
@AllArgsConstructor
public class KouncilConfigurationController {

    private final KouncilConfiguration kouncilConfiguration;

    @GetMapping
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


}
