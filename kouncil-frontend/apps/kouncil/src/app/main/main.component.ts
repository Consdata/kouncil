import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {SidebarService} from '../sidebar/sidebar.service';
import {LoggedInUserUtil} from '@app/common-auth';

@Component({
  selector: 'app-main',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>
    <app-banner *ngIf="isTemporaryAdminLoggedIn()">
      User permissions are not defined. You are currently logged in as a&nbsp;<b>temporary user</b>&nbsp;to
      define these permissions.&nbsp;<b> After logout this user will be removed.</b>
    </app-banner>
    <app-kafka-navbar></app-kafka-navbar>

    <div
      [ngClass]="backend === 'SERVER' ? ( isTemporaryAdminLoggedIn() ? 'kafka-desktop-banner' : 'kafka-desktop' ) : 'kafka-desktop-demo'">

      <app-sidebar></app-sidebar>

      <div [ngClass]="(sidebarService.isOpened$ | async) ? 'sidebarOpened' : 'sidebarClosed'">
        <app-survey></app-survey>
        <app-progress-bar></app-progress-bar>
        <router-outlet></router-outlet>
      </div>
    </div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  public backend: Backend = environment.backend;

  constructor(public sidebarService: SidebarService) {
  }

  isTemporaryAdminLoggedIn(): boolean {
    return LoggedInUserUtil.isTemporaryAdminLoggedIn();
  }
}
