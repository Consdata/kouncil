package com.consdata.kouncil.model.schemaregistry;

import com.consdata.kouncil.model.cluster.Cluster;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="SCHEMA_REGISTRY")
@Getter
@Setter
public class SchemaRegistry {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_SCHEMA_REGISTRY_GEN")
    @SequenceGenerator(name = "SEQ_SCHEMA_REGISTRY_GEN", sequenceName = "SEQ_SCHEMA_REGISTRY", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "URL", nullable = false)
    private String url;

    @OneToOne(mappedBy = "schemaRegistry")
    private Cluster cluster;

    @Embedded
    private SchemaRegistrySecurityConfig schemaRegistrySecurityConfig;
}
