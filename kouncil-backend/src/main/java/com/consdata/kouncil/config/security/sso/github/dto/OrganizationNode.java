package com.consdata.kouncil.config.security.sso.github.dto;

import lombok.Data;

@Data
public class OrganizationNode {
    private String login;
    private String name;
    private Teams teams;
}
