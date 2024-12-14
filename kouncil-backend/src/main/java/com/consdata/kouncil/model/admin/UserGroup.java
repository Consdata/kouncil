package com.consdata.kouncil.model.admin;

import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
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

    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST}, fetch = FetchType.EAGER)
    @JoinTable(name = "SYSTEM_FUNCTIONS_USER_GROUPS", joinColumns = @JoinColumn(name = "USER_GROUP_ID"), inverseJoinColumns = @JoinColumn(name = "FUNCTION_ID"))
    private Set<SystemFunction> functions;
}
