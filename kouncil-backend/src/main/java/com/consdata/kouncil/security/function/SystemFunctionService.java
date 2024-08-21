package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.SystemFunctionName;
import com.consdata.kouncil.security.function.dto.SystemFunctionDto;
import java.util.List;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemFunctionService {

    private final SystemFunctionsRepository systemFunctionsRepository;

    public List<SystemFunctionDto> getSystemFunctions() {
        return StreamSupport.stream(systemFunctionsRepository.findAll().spliterator(), false).filter(f -> !SystemFunctionName.LOGIN.equals(f.getName()))
                .map(SystemFunctionConverter::convertToFunctionDto)
                .toList();
    }
}
