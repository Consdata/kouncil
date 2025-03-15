package com.consdata.kouncil.model.cluster;

import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.Set;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "CLUSTER")
@Getter
@Setter
@EqualsAndHashCode(exclude = "id")
public class Cluster {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_CLUSTER_GEN")
    @SequenceGenerator(name = "SEQ_CLUSTER_GEN", sequenceName = "SEQ_CLUSTER", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 40, unique = true)
    private String name;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "CLUSTER_ID")
    private Set<Broker> brokers;

    @Column(name = "GLOBAL_JMX_PORT", length = 5)
    private Integer globalJmxPort;

    @Column(name = "GLOBAL_JMX_USER", length = 40)
    private String globalJmxUser;

    @Column(name = "GLOBAL_JMX_PASSWORD", length = 40)
    private String globalJmxPassword;

    @Embedded
    private ClusterSecurityConfig clusterSecurityConfig;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "SCHEMA_REGISTRY_ID", referencedColumnName = "ID")
    private SchemaRegistry schemaRegistry;
}
