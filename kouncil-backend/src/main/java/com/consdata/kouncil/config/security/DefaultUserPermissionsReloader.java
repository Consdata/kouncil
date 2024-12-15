package com.consdata.kouncil.config.security;

import com.consdata.kouncil.notifications.NotificationAction;
import com.consdata.kouncil.notifications.NotificationService;
import com.consdata.kouncil.notifications.NotificationType;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DefaultUserPermissionsReloader implements UserPermissionsReloader {

    private final NotificationService notificationService;

    @Override
    public void reloadPermissions(boolean sendNotification) {
        if (sendNotification) {
            notificationService.sendNotification(
                    "User permissions were updated. You have to re-login.",
                    NotificationType.PUSH_WITH_ACTION_REQUIRED,
                    NotificationAction.LOGOUT
            );
        }
    }
}
