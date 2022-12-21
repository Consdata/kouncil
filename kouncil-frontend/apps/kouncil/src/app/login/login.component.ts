import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {configProviderFactory} from '../app.module';
import {ServersService} from '@app/common-servers';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  template: `
    <app-kafka-navbar></app-kafka-navbar>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <div class="main-login">
        <form (ngSubmit)="login()" class="login-form">
          <input placeholder="Login" class="input" matInput type="text" [(ngModel)]="username"
                 name="username">
          <br>
          <input placeholder="Password" class="input" matInput type="password"
                 [(ngModel)]="password" name="password">
          <br>
          <button mat-button disableRipple class="action-button-white" type="submit">
            Zaloguj
          </button>
        </form>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public backend: Backend = environment.backend;
  username: string;
  password: string;

  constructor(private service: AuthService, private router: Router, private serverService: ServersService) {
  }

  login(): void {
    this.service.login$(this.username, this.password).subscribe(isValid => {
      if (isValid) {
        configProviderFactory(this.serverService).then(() => {
          this.router.navigate(['/topics']);
        });
      }
    });
  }
}
