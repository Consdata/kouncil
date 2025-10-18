package com.consdata.kouncil.datamasking.dto;

import com.consdata.kouncil.model.datamasking.MaskingType;
import lombok.Data;

@Data
public class PolicyFieldDto {

    private Long id;
    private MaskingType maskingType;
    private String field;
}
