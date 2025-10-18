package com.consdata.kouncil.config.security.sso.github.dto;

import lombok.Data;

@Data
public class Viewer {
    private String login;
    private Organizations organizations;
}
