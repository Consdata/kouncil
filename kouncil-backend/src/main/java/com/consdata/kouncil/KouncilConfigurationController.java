package com.consdata.kouncil;

import com.consdata.kouncil.logging.EntryExitLogger;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/connection")
@AllArgsConstructor
public class KouncilConfigurationController {

    private final KouncilConfiguration kouncilConfiguration;

    @GetMapping
    @EntryExitLogger
    public Map<String, String> getAllConnections() {
        return kouncilConfiguration.getServers();
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
