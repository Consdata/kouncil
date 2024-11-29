package com.consdata.kouncil.broker;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.KouncilRuntimeException;
import com.consdata.kouncil.config.BrokerConfig;
import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.logging.EntryExitLogger;
import com.consdata.kouncil.model.admin.SystemFunctionNameConstants;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.annotation.security.RolesAllowed;
import javax.management.MalformedObjectNameException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.Config;
import org.apache.kafka.clients.admin.ConfigEntry;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.apache.kafka.clients.admin.DescribeConfigsResult;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
public class BrokersController {

    private final KafkaConnectionService kafkaConnectionService;

    private final BrokerJXMClient brokerJXMClient;

    private final KouncilConfiguration kouncilConfiguration;

    @RolesAllowed(SystemFunctionNameConstants.BROKERS_LIST)
    @GetMapping("/api/brokers")
    @EntryExitLogger
    public BrokersDto getBrokers(@RequestParam("serverId") String serverId) {
        try {
            DescribeClusterResult describeClusterResult = kafkaConnectionService.getAdminClient(serverId).describeCluster();
            Collection<Node> nodes = describeClusterResult.nodes().get();
            List<KafkaBroker> kafkaBrokers = new ArrayList<>();
            nodes.forEach(node -> kafkaBrokers.add(KafkaBroker.builder()
                    .host(node.host())
                    .port(node.port())
                    .port(node.port())
                    .id(node.idString())
                    .rack(node.rack())
                    .build()));
            loadJmxMetrics(serverId, kafkaBrokers);
            Collections.sort(kafkaBrokers);
            return BrokersDto.builder().brokers(kafkaBrokers).build();
        } catch (Exception e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e);
        }
    }

    private void loadJmxMetrics(String serverId, List<KafkaBroker> kafkaBrokers) {
        kafkaBrokers.forEach(kafkaBroker -> {
            Optional<BrokerConfig> brokerConfig = kouncilConfiguration.getBrokerConfigFromCluster(
                    serverId,
                    kafkaBroker.getHost(),
                    kafkaBroker.getPort()
            );
            if (brokerConfig.isPresent() && brokerConfig.get().hasJmxConfig()) {
                try {
                    SystemConfiguration systemMetrics = brokerJXMClient.getSystemMetrics(brokerConfig.get());
                    kafkaBroker.setSystem(String.format("%s (%s, %s)",
                            systemMetrics.getName(),
                            systemMetrics.getVersion(),
                            systemMetrics.getArch()));
                    kafkaBroker.setAvailableProcessors(systemMetrics.getAvailableProcessors());
                    kafkaBroker.setFreeMem(systemMetrics.getFreePhysicalMemorySize());
                    kafkaBroker.setTotalMem(systemMetrics.getTotalPhysicalMemorySize());
                    kafkaBroker.setSystemLoadAverage(systemMetrics.getSystemLoadAverage());
                    kafkaBroker.setJmxStats(true);
                } catch (IOException | MalformedObjectNameException e) {
                    log.warn("Could not obtain JMX Metrics from broker {}", brokerConfig, e);
                }
            }
        });
    }

    @GetMapping("/api/configs/{name}")
    @RolesAllowed(SystemFunctionNameConstants.BROKER_DETAILS)
    @EntryExitLogger
    public Collection<KafkaBrokerConfig> getConfigs(@PathVariable("name") String name, @RequestParam("serverId") String serverId) {
        try {
            ConfigResource o = new ConfigResource(ConfigResource.Type.BROKER, name);
            Collection<ConfigResource> resources = Collections.singletonList(o);
            DescribeConfigsResult describeClusterResult = kafkaConnectionService.getAdminClient(serverId).describeConfigs(resources);
            KafkaFuture<Config> nodes = describeClusterResult.values().get(o);
            Collection<ConfigEntry> entries = nodes.get().entries();
            List<KafkaBrokerConfig> configs = new ArrayList<>();
            entries.forEach(e -> configs.add(KafkaBrokerConfig.builder()
                    .name(e.name())
                    .source(e.source())
                    .value(e.value())
                    .isReadOnly(e.isReadOnly())
                    .isSensitive(e.isSensitive())
                    .build()));
            return configs.stream().sorted().toList();
        } catch (Exception e) {
            Thread.currentThread().interrupt();
            throw new KouncilRuntimeException(e);
        }
    }
}
