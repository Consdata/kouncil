import {Component} from '@angular/core';
import {environment} from '../environments/environment';
import {Backend} from './app.backend';

@Component({
  selector: 'app-root',
  template: `
    <app-demo *ngIf="backend == 'DEMO'"></app-demo>
    <app-kafka-navbar></app-kafka-navbar>
    <div [ngClass]="backend == 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <app-progress-bar></app-progress-bar>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public backend: Backend = environment.backend;
}
