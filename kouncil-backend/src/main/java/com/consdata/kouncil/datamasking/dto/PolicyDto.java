package com.consdata.kouncil.datamasking.dto;

import com.consdata.kouncil.model.datamasking.MaskingType;
import java.util.Set;
import lombok.Data;

@Data
public class PolicyDto {

    private Long id;
    private String name;
    private MaskingType type;
    private Set<String> fields;
    private Set<PolicyResourceDto> resources;
}
