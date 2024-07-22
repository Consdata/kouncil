package com.consdata.kouncil.clusters;

import com.consdata.kouncil.KafkaConnectionService;
import com.consdata.kouncil.clusters.converter.ClusterConfigConverter;
import com.consdata.kouncil.clusters.converter.ClusterConverter;
import com.consdata.kouncil.clusters.converter.ClusterDtoConverter;
import com.consdata.kouncil.clusters.dto.ClusterDto;
import com.consdata.kouncil.config.ClusterConfig;
import com.consdata.kouncil.config.KouncilConfiguration;
import com.consdata.kouncil.model.cluster.Cluster;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class ClusterService {

    private final ClusterRepository clusterRepository;
    private final KouncilConfiguration kouncilConfiguration;
    private final KafkaConnectionService kafkaConnectionService;

    public ClusterDto getClusterByName(String clusterName) {
        Cluster cluster = clusterRepository.findByName(clusterName);
        return ClusterDtoConverter.convertToClusterDto(cluster);
    }

    public String saveCluster(ClusterDto cluster) {
        Cluster save = clusterRepository.save(ClusterConverter.convertToCluster(cluster));
        kouncilConfiguration.initializeClusters();
        return save.getName();
    }

    public boolean testConnection(ClusterDto clusterDto) {
        //double conversion to set default values
        ClusterConfig clusterConfig = ClusterConfigConverter.convertToClusterConfig(
                ClusterDtoConverter.convertToClusterDto(ClusterConverter.convertToCluster(clusterDto)));

        clusterConfig.getKafka().getProperties().put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
        clusterConfig.getKafka().getProperties().put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, "10000");

        kafkaConnectionService.cleanAdminClients();

        kouncilConfiguration.getClusterConfig().clear();
        kouncilConfiguration.getClusterConfig().put(clusterDto.getName(), clusterConfig);

        try (AdminClient adminClient = kafkaConnectionService.getAdminClient(clusterDto.getName())) {
            adminClient.describeCluster().nodes().get();
            return true;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        } finally {
            kafkaConnectionService.cleanAdminClients();
            kouncilConfiguration.initializeClusters();
        }
    }

    public boolean isClusterNameUnique(String clusterName) {
        return clusterRepository.findByName(clusterName) == null;
    }
}
