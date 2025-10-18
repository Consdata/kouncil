package com.consdata.kouncil.datamasking;

import static org.assertj.core.api.Assertions.assertThat;

import com.consdata.kouncil.clusters.ClusterRepository;
import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.admin.UserGroup;
import com.consdata.kouncil.model.cluster.Cluster;
import com.consdata.kouncil.model.cluster.ClusterAuthenticationMethod;
import com.consdata.kouncil.model.cluster.ClusterSecurityConfig;
import com.consdata.kouncil.model.datamasking.MaskingType;
import com.consdata.kouncil.model.datamasking.Policy;
import com.consdata.kouncil.model.datamasking.PolicyField;
import com.consdata.kouncil.model.datamasking.PolicyResource;
import com.consdata.kouncil.security.group.UserGroupRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;

@SpringBootTest
@DirtiesContext
class PoliciesServiceTest {

    @Autowired
    PoliciesService uut;

    @Autowired
    PolicyRepository repository;
    @Autowired
    ClusterRepository clusterRepository;
    @Autowired
    UserGroupRepository userGroupRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"VIEWER"})
    void should_mask_message_content_when_policy_defined_for_user_group() {
        UserGroup viewerGroup = userGroupRepository.save(createUserGroup("VIEWER", "viewer"));
        UserGroup editorGroup = userGroupRepository.save(createUserGroup("EDITOR", "editor"));

        clusterRepository.save(createCluster("cluster"));
        clusterRepository.save(createCluster("cluster-test"));
        clusterRepository.save(createCluster("cluster-non-usable"));

        Map<String, Cluster> clusters = StreamSupport.stream(clusterRepository.findAll().spliterator(), false)
                .collect(Collectors.toMap(Cluster::getName, cluster -> cluster));


        repository.save(createPolicy("policy-all-resources", true, null, null, viewerGroup));
        repository.save(createPolicy("policy-cluster-1-all-topics", false, clusters.get("cluster").getId(), ".*", viewerGroup));
        repository.save(createPolicy("policy-cluster-1-test-topic-viewer-group", false, clusters.get("cluster").getId(), "test-topic", viewerGroup));
        repository.save(createPolicy("policy-cluster-1-test-topic-editor-group", false, clusters.get("cluster").getId(), "test-topic", editorGroup));
        repository.save(createPolicy("policy-cluster-1-kouncil-user-info-topic", false, clusters.get("cluster").getId(), "kouncil-user-info", viewerGroup));
        repository.save(createPolicy("policy-cluster-2", false, clusters.get("cluster-test").getId(), "test-topic", viewerGroup));
        repository.save(createPolicy("policy-cluster-3", false, clusters.get("cluster-non-usable").getId(), "kouncil-user-info", editorGroup));

        List<Policy> policies = uut.getPoliciesForClusterAndTopic("test-topic", "cluster");
        assertThat(policies).hasSize(3);
    }

    private UserGroup createUserGroup(String code, String name) {
        UserGroup userGroup = new UserGroup();
        userGroup.setCode(code);
        userGroup.setName(name);
        return userGroup;
    }

    private Cluster createCluster(String clusterName) {
        Cluster cluster = new Cluster();
        cluster.setName(clusterName);
        cluster.setClusterSecurityConfig(new ClusterSecurityConfig());
        cluster.getClusterSecurityConfig().setAuthenticationMethod(ClusterAuthenticationMethod.NONE);

        Broker broker = new Broker();
        broker.setBootstrapServer("localhost:9092");
        cluster.setBrokers(Set.of(broker));
        return cluster;
    }

    private Policy createPolicy(String policyName, boolean applyToAllResources, Long clusterId, String topic, UserGroup userGroup) {
        Policy policy = new Policy();

        policy.setName(policyName);
        PolicyField policyField = new PolicyField();
        policyField.setField("value");
        policyField.setMaskingType(MaskingType.FIRST_5);
        policy.setFields(Set.of(policyField));

        policy.setApplyToAllResources(applyToAllResources);
        if (!applyToAllResources) {
            PolicyResource resource = new PolicyResource();
            resource.setCluster(clusterId);
            resource.setTopic(topic);
            policy.setResources(Set.of(resource));
        }

        policy.setUserGroups(Set.of(userGroup));
        return policy;
    }
}
