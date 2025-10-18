package com.consdata.kouncil.datamasking;

import com.consdata.kouncil.clusters.ClusterRepository;
import com.consdata.kouncil.datamasking.converter.PolicyDtoConverter;
import com.consdata.kouncil.datamasking.dto.PolicyDto;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.security.SecurityConstants;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class PoliciesService {

    private final PolicyRepository policyRepository;
    private final ClusterRepository clusterRepository;

    public List<PolicyDto> getPolicies(){
        Iterable<Policy> all = policyRepository.findAll();
        List<PolicyDto> policies = new ArrayList<>();
        all.forEach(policy -> policies.add(PolicyDtoConverter.convertToDto(policy)));
        return policies;
    }

    public List<Policy> getPoliciesForClusterAndTopic(String topic, String clusterId) {
        Map<Long, Cluster> clusters = StreamSupport.stream(clusterRepository.findAll().spliterator(), false)
                .collect(Collectors.toMap(Cluster::getId, cluster -> cluster));
        Set<Policy> policies = StreamSupport.stream(policyRepository.findAll().spliterator(), false)
                .collect(Collectors.toSet());

        Set<String> authorities = getCurrentUserRoles();

        return policies.stream()
                .filter(policy -> policy.getApplyToAllResources()
                        || (isClusterInPolicyResources(policy, clusterId, clusters) && isTopicInPolicyResources(policy, topic))
                )
                .filter(policy -> policy.getUserGroups().stream().anyMatch(group -> authorities.contains(group.getCode())))
                .toList();
    }

    private boolean isClusterInPolicyResources(Policy policy, String clusterId, Map<Long, Cluster> clusters) {
        return policy.getResources().stream().anyMatch(resource -> clusters.get(resource.getCluster()).getName().equals(clusterId));
    }

    private boolean isTopicInPolicyResources(Policy policy, String topic) {
        return policy.getResources().stream().anyMatch(resource -> {
            Pattern pattern = Pattern.compile(resource.getTopic());
            return pattern.matcher(topic).matches();
        });
    }

    private Set<String> getCurrentUserRoles() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(SecurityConstants.ROLE_PREFIX))
                .map(authority -> authority.replace(SecurityConstants.ROLE_PREFIX, ""))
                .collect(Collectors.toSet());
    }
}
