package com.consdata.kouncil.model;

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
@Table(name = "BROKER")
@Getter
@Setter
public class Broker {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_BROKER_GEN")
    @SequenceGenerator(name = "SEQ_BROKER_GEN", sequenceName = "SEQ_BROKER", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "BOOTSTRAP_SERVER", nullable = false)
    private String bootstrapServer;

    @Column(name = "JMX_PORT", length = 5)
    private Integer jmxPort;

    @Column(name = "JMX_USER", length = 40)
    private String jmxUser;

    @Column(name = "JMX_PASSWORD", length = 40)
    private String jmxPassword;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "CLUSTER_ID", insertable = false, updatable = false)
    private Cluster cluster;
}
