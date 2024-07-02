package com.consdata.kouncil.model.cluster;

import com.consdata.kouncil.model.Broker;
import com.consdata.kouncil.model.schemaregistry.SchemaRegistry;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "CLUSTER")
@Getter
@Setter
public class Cluster {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_CLUSTER_GEN")
    @SequenceGenerator(name = "SEQ_CLUSTER_GEN", sequenceName = "SEQ_CLUSTER", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 40, unique = true)
    private String name;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "CLUSTER_ID")
    private Set<Broker> brokers;

    @Embedded
    private ClusterSecurityConfig clusterSecurityConfig;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "SCHEMA_REGISTRY_ID", referencedColumnName = "ID")
    private SchemaRegistry schemaRegistry;
}
