import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {MatButtonModule} from '@angular/material/button';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NotificationButtonComponent} from './notification-button/notification-button.component';
import {NotificationComponent} from './notification/notification.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    FeatNoDataModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    MatDialogModule
  ],
  declarations: [
    NotificationButtonComponent,
    NotificationComponent
  ],
  exports: [
    NotificationButtonComponent,
    NotificationComponent
  ]
})
export class FeatNotificationsModule {
}
