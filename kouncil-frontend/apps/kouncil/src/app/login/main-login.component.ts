import {Component} from '@angular/core';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-home-login',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>
    <app-kafka-navbar [hideForAuthenticated]="true"></app-kafka-navbar>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <app-progress-bar></app-progress-bar>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./main-login.component.scss']
})
export class MainLoginComponent {

  public backend: Backend = environment.backend;

  constructor() {
  }
}
