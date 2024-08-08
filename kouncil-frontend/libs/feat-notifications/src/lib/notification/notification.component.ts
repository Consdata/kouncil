import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NotificationAction, NotificationModel} from '../notification.model';

@Component({
  selector: 'app-notification',
  template: `
    <div mat-dialog-title class="header">
      <div class="title">Action required</div>
      <div class="spacer"></div>
      <mat-icon mat-dialog-close class="material-symbols-outlined">close</mat-icon>
    </div>

    <mat-dialog-content class="mat-typography">
      <div class="message">{{ data.message }}</div>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-flat-button class="action-button-blue" mat-dialog-close>
        {{ actionBtnLabel() }}
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: NotificationModel) {
  }

  actionBtnLabel(): string {
    switch (this.data.action) {
      case NotificationAction.LOGOUT:
        return 'Logout';
    }
    return '';
  }
}
