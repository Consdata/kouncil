package com.consdata.kouncil.config.security;

import com.consdata.kouncil.notifications.Notification;
import com.consdata.kouncil.notifications.NotificationAction;
import com.consdata.kouncil.notifications.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RequiredArgsConstructor
public class DefaultUserPermissionsReloader implements UserPermissionsReloader {

    private final SimpMessagingTemplate eventSender;

    @Override
    public void reloadPermissions() {
        Notification notification = new Notification();
        notification.setMessage("User permissions were updated. You have to re-login.");
        notification.setType(NotificationType.PUSH_WITH_ACTION_REQUIRED);
        notification.setAction(NotificationAction.LOGOUT);
        eventSender.convertAndSend("/notifications", notification);
    }
}
