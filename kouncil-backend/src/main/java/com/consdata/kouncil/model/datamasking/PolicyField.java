package com.consdata.kouncil.model.datamasking;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "POLICY_FIELD")
@Getter
@Setter
public class PolicyField {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_POLICY_FIELD_GEN")
    @SequenceGenerator(name = "SEQ_POLICY_FIELD_GEN", sequenceName = "SEQ_POLICY_FIELD", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "FIELD")
    private String field;

    @Column(name = "FIND_RULE")
    @Enumerated(EnumType.STRING)
    private FieldFindRule findRule;

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "POLICY_ID", insertable = false, updatable = false)
    private Policy policy;
}
