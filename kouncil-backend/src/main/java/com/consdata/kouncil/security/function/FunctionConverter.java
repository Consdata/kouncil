package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.Function;
import com.consdata.kouncil.security.function.dto.FunctionDto;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class FunctionConverter {

    public static FunctionDto convertToFunctionDto(Function function) {
        FunctionDto functionDto = new FunctionDto();
        functionDto.setId(function.getId());
        functionDto.setName(function.getName());
        functionDto.setLabel(function.getLabel());
        functionDto.setFunctionGroup(function.getFunctionGroup());
        return functionDto;
    }

    public static Function convertToFunction(FunctionDto functionDto) {
        Function function = new Function();
        function.setId(functionDto.getId());
        function.setName(functionDto.getName());
        function.setLabel(functionDto.getLabel());
        function.setFunctionGroup(functionDto.getFunctionGroup());
        return function;
    }
}
