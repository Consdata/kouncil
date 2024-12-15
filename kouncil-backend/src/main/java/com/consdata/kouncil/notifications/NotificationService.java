package com.consdata.kouncil.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate eventSender;

    public void sendNotification(String message, NotificationType notificationType, NotificationAction action) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(notificationType);
        notification.setAction(action);
        eventSender.convertAndSend("/notifications", notification);
    }
}
