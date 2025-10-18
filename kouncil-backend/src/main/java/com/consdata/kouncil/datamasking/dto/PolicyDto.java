package com.consdata.kouncil.datamasking.dto;

import java.util.Set;
import lombok.Data;

@Data
public class PolicyDto {

    private Long id;
    private String name;
    private Boolean applyToAllResources;
    private Set<PolicyFieldDto> fields;
    private Set<PolicyResourceDto> resources;
    private Set<Long> userGroups;
}
