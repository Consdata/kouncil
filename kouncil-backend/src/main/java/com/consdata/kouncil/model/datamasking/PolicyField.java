package com.consdata.kouncil.model.datamasking;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
