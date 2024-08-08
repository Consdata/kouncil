package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.security.RolesAllowed;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class KouncilConfigurationController {

    private final KouncilConfiguration kouncilConfiguration;

    @Value("${kouncil.context-path:}")
    private String contextPath;

    @RolesAllowed(Fields.LOGIN)
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

    @GetMapping("/context-path")
    public String getContextPath() {
        return contextPath;
    }
}
