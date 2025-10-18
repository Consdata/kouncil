package com.consdata.kouncil.model.datamasking;

import com.consdata.kouncil.model.admin.UserGroup;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.Set;
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

    @OneToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.EAGER)
    @JoinTable(name = "POLICY_USER_GROUPS", joinColumns = @JoinColumn(name = "POLICY_ID"), inverseJoinColumns = @JoinColumn(name = "USER_GROUP_ID"))
    private Set<UserGroup> userGroups;
}
