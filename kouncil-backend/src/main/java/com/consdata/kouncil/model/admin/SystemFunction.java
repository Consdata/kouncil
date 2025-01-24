package com.consdata.kouncil.model.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.Set;
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
