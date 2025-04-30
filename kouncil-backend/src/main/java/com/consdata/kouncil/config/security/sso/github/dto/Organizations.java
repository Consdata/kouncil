package com.consdata.kouncil.config.security.sso.github.dto;

import java.util.List;
import lombok.Data;

@Data
public class Organizations {
    private List<OrganizationNode> nodes;
}
