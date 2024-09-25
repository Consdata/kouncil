package com.consdata.kouncil.model.datamasking;

import java.util.Set;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "POLICY")
@Getter
@Setter
public class Policy {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_POLICY_GEN")
    @SequenceGenerator(name = "SEQ_POLICY_GEN", sequenceName = "SEQ_POLICY", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "MASKING_TYPE")
    @Enumerated(EnumType.STRING)
    private MaskingType type;

    @ElementCollection
    @CollectionTable(name = "POLICY_FIELDS", joinColumns = @JoinColumn(name = "POLICY_ID"))
    @Column(name = "FIELD")
    private Set<String> fields;


    @ElementCollection
    @CollectionTable(name = "POLICY_RESOURCES", joinColumns = @JoinColumn(name = "POLICY_ID"))
    @Column(name = "RESOURCES")
    private Set<String> resources;
}
