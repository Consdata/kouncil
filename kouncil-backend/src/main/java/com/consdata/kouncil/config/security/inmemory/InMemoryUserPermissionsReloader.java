package com.consdata.kouncil.config.security.inmemory;

import com.consdata.kouncil.config.security.DefaultUserPermissionsReloader;
import com.consdata.kouncil.notifications.NotificationService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "kouncil.auth", name = "active-provider", havingValue = "inmemory")
public class InMemoryUserPermissionsReloader extends DefaultUserPermissionsReloader {

    private final InMemoryUserManager inMemoryUserManager;

    public InMemoryUserPermissionsReloader(NotificationService notificationService, InMemoryUserManager inMemoryUserManager) {
        super(notificationService);
        this.inMemoryUserManager = inMemoryUserManager;
    }

    @Override
    public void reloadPermissions(boolean sendNotification) {
        super.reloadPermissions(sendNotification);
        inMemoryUserManager.reloadUsers();
    }
}
