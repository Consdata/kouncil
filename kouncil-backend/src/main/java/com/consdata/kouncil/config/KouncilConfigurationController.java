package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{serverId}")
    @EntryExitLogger
    public void removeServer(@PathVariable("serverId") String serverId) {
        kouncilConfiguration.removeServer(serverId);
    }

    @PutMapping()
    @EntryExitLogger
    public void addServer(@RequestBody String bootstrapAddress) {
        kouncilConfiguration.addServer(bootstrapAddress);
    }

}
