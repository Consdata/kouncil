package com.consdata.kouncil.model.datamasking;

import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
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

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "POLICY_ID")
    private Set<PolicyField> fields;

    @Column(name = "APPLY_TO_ALL_RESOURCES")
    private Boolean applyToAllResources;

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "POLICY_ID")
    private Set<PolicyResource> resources;
}
