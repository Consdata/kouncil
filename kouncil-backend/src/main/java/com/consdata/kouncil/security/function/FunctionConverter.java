package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.security.function.dto.SystemFunctionDto;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class FunctionConverter {

    public static SystemFunctionDto convertToFunctionDto(SystemFunction function) {
        SystemFunctionDto functionDto = new SystemFunctionDto();
        functionDto.setId(function.getId());
        functionDto.setName(function.getName());
        functionDto.setLabel(function.getLabel());
        functionDto.setFunctionGroup(function.getFunctionGroup());
        return functionDto;
    }

    public static SystemFunction convertToFunction(SystemFunctionDto functionDto) {
        SystemFunction function = new SystemFunction();
        function.setId(functionDto.getId());
        function.setName(functionDto.getName());
        function.setLabel(functionDto.getLabel());
        function.setFunctionGroup(functionDto.getFunctionGroup());
        return function;
    }
}
