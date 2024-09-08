package com.consdata.kouncil.model.admin;

import java.util.Set;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "SYSTEM_FUNCTION")
@Getter
@Setter
public class SystemFunction {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_SYSTEM_FUNCTION_GEN")
    @SequenceGenerator(name = "SEQ_SYSTEM_FUNCTION_GEN", sequenceName = "SEQ_SYSTEM_FUNCTION", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "NAME", length = 40, unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    private SystemFunctionName name;

    @Column(name = "LABEL")
    private String label;

    @Column(name = "FUNCTION_GROUP")
    @Enumerated(EnumType.STRING)
    private FunctionGroup functionGroup;

    @ManyToMany(mappedBy = "functions", fetch = FetchType.EAGER)
    private Set<UserGroup> userGroups;
}
