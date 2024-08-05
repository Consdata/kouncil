package com.consdata.kouncil.notifications;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Notification {

    private String message;
    private NotificationType type;
    private NotificationAction action;

}
