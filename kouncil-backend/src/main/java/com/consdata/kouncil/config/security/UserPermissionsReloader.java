package com.consdata.kouncil.config.security;

public interface UserPermissionsReloader {

    void reloadPermissions(boolean sendNotification);
}
