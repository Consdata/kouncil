import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {SidebarService} from "../side-bar/sidebar.service";

@Component({
  selector: 'app-main',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>

    <app-kafka-navbar></app-kafka-navbar>
    <div style="display: flex">

      <app-kafka-sidebar></app-kafka-sidebar>

      <div [ngClass]="(sidebarService.isOpened | async) ? 'sidebarOpened' : 'sidebarClosed'">
        <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
          <app-progress-bar></app-progress-bar>
          <router-outlet></router-outlet>
        </div>
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
}
