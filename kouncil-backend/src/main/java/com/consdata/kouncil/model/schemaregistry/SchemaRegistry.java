package com.consdata.kouncil.model.schemaregistry;

import com.consdata.kouncil.model.cluster.Cluster;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="SCHEMA_REGISTRY")
@Getter
@Setter
@EqualsAndHashCode(exclude = {"id", "cluster"})
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
