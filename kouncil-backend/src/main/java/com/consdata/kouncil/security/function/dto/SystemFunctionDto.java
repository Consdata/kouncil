package com.consdata.kouncil.security.function.dto;

import com.consdata.kouncil.model.admin.FunctionGroup;
import com.consdata.kouncil.model.admin.SystemFunctionName;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SystemFunctionDto {

    private Long id;
    private SystemFunctionName name;
    private String label;
    private FunctionGroup functionGroup;
}
