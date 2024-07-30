package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.FunctionName;
import com.consdata.kouncil.security.function.dto.FunctionDto;
import java.util.List;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FunctionService {

    private final FunctionsRepository functionsRepository;

    public List<FunctionDto> getFunctions() {
        return StreamSupport.stream(functionsRepository.findAll().spliterator(), false).filter(f -> !FunctionName.LOGIN.equals(f.getName()))
                .map(FunctionConverter::convertToFunctionDto)
                .toList();
    }
}
