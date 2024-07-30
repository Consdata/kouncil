package com.consdata.kouncil.security.function.dto;

import com.consdata.kouncil.model.admin.FunctionGroup;
import com.consdata.kouncil.model.admin.FunctionName;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FunctionDto {

    private Long id;
    private FunctionName name;
    private String label;
    private FunctionGroup functionGroup;
}
