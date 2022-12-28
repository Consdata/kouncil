import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {User} from '@app/common-login';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  template: `
    <app-common-login-icon *ngIf="this.backend === 'SERVER'"
                           [iconContainerClass]="'icon-login-container-desktop'"></app-common-login-icon>
    <app-common-login-icon *ngIf="this.backend === 'DEMO'"
                           [iconContainerClass]="'icon-login-container-demo'"></app-common-login-icon>

    <app-common-login (loginUser)="login($event)">

      <div info *ngIf="firstTimeLogin" class="first-time-login">
        <span>Default user credentials:</span>
        <span>username: admin</span>
        <span>password: admin</span>
      </div>

    </app-common-login>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  firstTimeLogin: boolean = false;
  providers: Array<string>;
  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.service.ssoProviders$().subscribe(providers => this.providers = providers);
    this.service.firstTimeLogin$().subscribe(firstTime => {
      this.firstTimeLogin = firstTime;
    });
  }

  ngOnInit(): void {
    this.service.clearLoggedIn();
  }

  login($event: User): void {
    this.service.login$($event).subscribe(isValid => {
      if (isValid) {
        if (this.firstTimeLogin) {
          this.router.navigate(['/changePassword']);
        } else {
          this.router.navigate(['/topics']);
        }
      }
    });
  }

  sso(provider: string): void {
    this.service.sso$(provider).subscribe();
  }

  getIconContainerClass(): string {
    return this.backend === 'SERVER' ? 'icon-login-container-desktop' : 'icon-login-container-demo';
  }
}
