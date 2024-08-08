package com.consdata.kouncil.security.group.dto;

import com.consdata.kouncil.security.function.dto.SystemFunctionDto;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserGroupDto {

    private Long id;
    private String code;
    private String name;
    private Set<SystemFunctionDto> functions;
}
