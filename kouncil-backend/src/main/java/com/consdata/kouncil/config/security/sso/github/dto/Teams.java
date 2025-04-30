package com.consdata.kouncil.config.security.sso.github.dto;

import java.util.List;
import lombok.Data;

@Data
public class Teams {
    private List<TeamNode> nodes;
}
