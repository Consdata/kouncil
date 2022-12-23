import {AfterViewInit, Component} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {User} from '@app/common-login';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  template: `
    <app-common-login (loginUser)="login($event)" [backend]="backend"
                      [availableProviders]="providers"
                      [firstTimeLogin]="firstTimeLogin" (ssoEvent)="sso($event)"></app-common-login>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {

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
}
