package com.consdata.kouncil.datamasking.dto;

import com.consdata.kouncil.model.datamasking.FieldFindRule;
import lombok.Data;

@Data
public class PolicyFieldDto {

    private Long id;
    private FieldFindRule findRule;
    private String field;
}
