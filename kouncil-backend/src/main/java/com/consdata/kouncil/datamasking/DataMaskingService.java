package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.clusters.ClusterRepository;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.datamasking.Policy;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataMaskingService {

    private final PolicyRepository repository;
    private final ClusterRepository clusterRepository;

    public String maskTopicMessage(String message, String topic, String clusterId) {
        List<Policy> list = getPoliciesForClusterAndTopic(topic, clusterId);

        for (Policy policy : list) {
            message = PolicyApplier.apply(policy, message);
        }
        return message;
    }

    private List<Policy> getPoliciesForClusterAndTopic(String topic, String clusterId) {
        Map<Long, Cluster> clusters = StreamSupport.stream(clusterRepository.findAll().spliterator(), false)
                .collect(Collectors.toMap(Cluster::getId, cluster -> cluster));
        Set<Policy> policies = StreamSupport.stream(repository.findAll().spliterator(), false)
                .collect(Collectors.toSet());

        return policies.stream()
                .filter(policy -> policy.getResources().stream().anyMatch(resource -> clusters.get(resource.getCluster()).getName().equals(clusterId)))
                .filter(policy -> policy.getResources().stream().anyMatch(resource -> {
                    Pattern pattern = Pattern.compile(resource.getTopic());
                    return pattern.matcher(topic).matches();
                }))
                .toList();
    }
}
