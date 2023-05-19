package com.consdata.kouncil.config.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class RoleNames {

    public static final String ADMIN_ROLE = "ROLE_KOUNCIL_ADMIN";
    public static final String EDITOR_ROLE = "ROLE_KOUNCIL_EDITOR";
    public static final String VIEWER_ROLE = "ROLE_KOUNCIL_VIEWER";
}
