package com.consdata.kouncil.datamasking.dto;

import com.consdata.kouncil.model.datamasking.MaskingType;
import java.util.Set;
import lombok.Data;

@Data
public class PolicyDto {

    private Long id;
    private String name;
    private MaskingType maskingType;
    private Boolean applyToAllResources;
    private Set<PolicyFieldDto> fields;
    private Set<PolicyResourceDto> resources;
}
