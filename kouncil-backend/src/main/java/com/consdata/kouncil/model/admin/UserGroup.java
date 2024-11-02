package com.consdata.kouncil.model.admin;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "USER_GROUP")
@Getter
@Setter
public class UserGroup {

    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SEQ_USER_GROUP_GEN")
    @SequenceGenerator(name = "SEQ_USER_GROUP_GEN", sequenceName = "SEQ_USER_GROUP", initialValue = 1, allocationSize = 1)
    private Long id;

    @Column(name = "CODE", unique = true)
    private String code;

    @Column(name = "NAME")
    private String name;

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "SYSTEM_FUNCTIONS_USER_GROUPS", joinColumns = @JoinColumn(name = "USER_GROUP_ID"), inverseJoinColumns = @JoinColumn(name = "FUNCTION_ID"))
    private Set<SystemFunction> functions;
}
