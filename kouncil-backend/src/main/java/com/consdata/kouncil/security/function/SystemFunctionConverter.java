package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.SystemFunction;
import com.consdata.kouncil.security.function.dto.SystemFunctionDto;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SystemFunctionConverter {

    public static SystemFunctionDto convertToFunctionDto(SystemFunction function) {
        SystemFunctionDto functionDto = new SystemFunctionDto();
        BeanUtils.copyProperties(function, functionDto);
        return functionDto;
    }

    public static SystemFunction convertToFunction(SystemFunctionDto functionDto) {
        SystemFunction function = new SystemFunction();
        BeanUtils.copyProperties(functionDto, function);
        return function;
    }
}
