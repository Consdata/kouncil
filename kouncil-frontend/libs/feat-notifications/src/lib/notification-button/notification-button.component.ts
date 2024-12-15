import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {RxStompService} from '../rx-stomp.service';
import {MatDialog} from '@angular/material/dialog';
import {NotificationComponent} from '../notification/notification.component';
import {AuthService} from '@app/common-auth';
import {Router} from '@angular/router';
import {NotificationAction, NotificationModel, NotificationType} from '../notification.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarComponent, SnackBarData} from '@app/common-utils';

@Component({
  selector: 'app-notification-button',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationButtonComponent implements OnDestroy {

  subscription: Subscription = new Subscription();

  constructor(private rxStompService: RxStompService,
              private dialog: MatDialog,
              private router: Router,
              private authService: AuthService,
              private snackBar: MatSnackBar) {

    this.subscription.add(this.rxStompService.watch('/notifications')
    .subscribe((message) => {
      const notification: NotificationModel = JSON.parse(message.body);
      switch (notification.type) {
        case NotificationType.PUSH_WITH_ACTION_REQUIRED:
          this.processPushWithActionNotification(notification);
          break;
        case NotificationType.PUSH:
          this.openPushNotification(notification);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private processPushWithActionNotification(notification: NotificationModel): void {
    const matDialogRef = this.dialog.open(NotificationComponent, {
      width: '600px',
      panelClass: ['confirm', 'dialog-with-padding'],
      data: notification
    });
    this.subscription.add(matDialogRef.afterClosed().subscribe(() => {
      switch (notification.action) {
        case NotificationAction.LOGOUT:
          this.logout();
          break;
      }
    }));
  }

  private logout(): void {
    this.subscription.add(this.authService.logout$().subscribe(() => {
      this.router.navigate(['/login']);
    }));
  }

  private openPushNotification(notification: NotificationModel) {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: new SnackBarData(notification.message, 'snackbar-error', 'Close'),
      panelClass: ['snackbar']
    });
  }
}
