package com.consdata.kouncil.model.datamasking;

import com.consdata.kouncil.model.cluster.Cluster;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
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
