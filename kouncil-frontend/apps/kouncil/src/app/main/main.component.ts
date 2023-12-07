import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-main',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>
    <app-kafka-navbar></app-kafka-navbar>

    <app-survey></app-survey>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <app-progress-bar></app-progress-bar>
      <router-outlet></router-outlet>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./main.component.scss']
})
export class MainComponent {

  public backend: Backend = environment.backend;

  constructor() {
  }
}
