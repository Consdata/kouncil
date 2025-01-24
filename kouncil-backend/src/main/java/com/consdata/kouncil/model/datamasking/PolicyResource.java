package com.consdata.kouncil.model.datamasking;

import com.consdata.kouncil.model.cluster.Cluster;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "POLICY_RESOURCE")
@Getter
@Setter
public class PolicyResource {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_POLICY_RESOURCE_GEN")
    @SequenceGenerator(name = "SEQ_POLICY_RESOURCE_GEN", sequenceName = "SEQ_POLICY_RESOURCE", initialValue = 1, allocationSize = 1)
    private Long id;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "CLUSTER_ID", insertable = false, updatable = false)
    private Cluster cluster;

    @Column(name = "TOPIC")
    private String topic;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "POLICY_ID", insertable = false, updatable = false)
    private Policy policy;
}
