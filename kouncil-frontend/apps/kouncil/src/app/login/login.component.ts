import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {configProviderFactory} from '../app.module';
import {ServersService} from '@app/common-servers';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {User} from '@app/common-login';

@Component({
  selector: 'app-login',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>
    <app-kafka-navbar></app-kafka-navbar>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <app-common-login (loginUser)="login($event)"></app-common-login>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router, private serverService: ServersService) {
  }

  login($event: User): void {
    this.service.login$($event).subscribe(isValid => {
      if (isValid) {
        configProviderFactory(this.serverService).then(() => {
          this.router.navigate(['/topics']);
        });
      }
    });
  }
}
