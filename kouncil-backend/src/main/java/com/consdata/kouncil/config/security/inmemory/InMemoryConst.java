package com.consdata.kouncil.config.security.inmemory;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class InMemoryConst {

    public static final String ADMIN_USERNAME = "admin";
    public static final String ADMIN_DEFAULT_PASSWORD = "admin";
    public static final String ADMIN_DEFAULT_GROUP = "admin_group";
    public static final String ADMIN_CONFIG = "default_admin_password.txt";
    public static final String EDITOR_USERNAME = "editor";
    public static final String EDITOR_DEFAULT_PASSWORD = "editor";
    public static final String EDITOR_DEFAULT_GROUP = "editor_group";
    public static final String EDITOR_CONFIG = "default_editor_password.txt";
    public static final String VIEWER_USERNAME = "viewer";
    public static final String VIEWER_DEFAULT_PASSWORD = "viewer";
    public static final String VIEWER_DEFAULT_GROUP = "viewer_group";
    public static final String VIEWER_CONFIG = "default_viewer_password.txt";
}
