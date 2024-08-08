package com.consdata.kouncil.security.function;

import com.consdata.kouncil.model.admin.SystemFunctionName.Fields;
import com.consdata.kouncil.security.function.dto.SystemFunctionDto;
import java.util.List;
import javax.annotation.security.RolesAllowed;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class FunctionsController {

    private final FunctionService functionService;

    @RolesAllowed(Fields.USER_GROUPS)
    @GetMapping(path = "/api/functions")
    public List<SystemFunctionDto> getFunctions() {
        return functionService.getFunctions();
    }
}
