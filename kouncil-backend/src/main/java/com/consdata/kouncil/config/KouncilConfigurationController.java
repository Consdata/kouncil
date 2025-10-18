package com.consdata.kouncil.config;

import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.logging.EntryExitLogger;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import jakarta.annotation.security.RolesAllowed;
import com.consdata.kouncil.notifications.NotificationAction;
import com.consdata.kouncil.notifications.NotificationService;
import com.consdata.kouncil.notifications.NotificationType;
import com.consdata.kouncil.security.FirstTimeApplicationLaunchService;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;
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
    private final NotificationService notificationService;
    private final FirstTimeApplicationLaunchService firstTimeApplicationLaunchService;

    @Value("${kouncil.context-path:}")
    private String contextPath;

    @RolesAllowed(SystemFunctionNameConstants.LOGIN)
    @GetMapping("/connection")
    @EntryExitLogger
    public Map<String, String> getAllConnections() {
        Map<String, String> collect = kouncilConfiguration
                .getClusterConfig()
                .entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Entry::getKey,
                        entry -> entry
                                .getValue()
                                .getBrokers()
                                .stream()
                                .findFirst()
                                .map(BrokerConfig::getAddress)
                                .orElseThrow(() -> new KouncilRuntimeException("Broker not found"))
                ));

        if(collect.isEmpty() && !firstTimeApplicationLaunchService.isTemporaryAdminLoggedIn()) {
            notificationService.sendNotification(
                    "Clusters are not defined. Please register new clusters or reach out to your administrator for further information.",
                    NotificationType.PUSH,
                    NotificationAction.CLUSTERS_NOT_DEFINED
            );
        }


        return collect;
    }

    @GetMapping("/context-path")
    public String getContextPath() {
        return contextPath;
    }
}
