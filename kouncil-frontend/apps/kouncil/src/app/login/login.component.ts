import {Component, OnInit} from '@angular/core';
import {AuthService, SystemFunctionName} from '@app/common-auth';
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

      <div info *ngIf="inmemory" class="first-time-login">
        <span>Default users: superuser, admin, editor, viewer</span>
      </div>

    </app-common-login>

    <app-common-login-sso *ngIf="providers && providers.length >0"
                          [availableProviders]="providers"
                          (ssoEvent)="sso($event)"></app-common-login-sso>

  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  firstTimeLogin: boolean = false;
  inmemory: boolean = false;
  providers: Array<string> = [];
  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.service.clearLoggedIn();
    this.service.activeProvider$().subscribe(activeProvider => {
      if (activeProvider === 'inmemory') {
        this.inmemory = true;
      } else if (activeProvider === 'sso') {
        this.fetchSsoProviders();
        this.fetchContextPath();
      }
    });
  }

  login($event: User): void {
    this.service.login$($event).subscribe(isValid => {
      if (isValid) {
        if (this.inmemory) {
          this.checkFirstTimeLogin($event.username);
        } else {
          this.fetchUserRoles();
          this.fetchInstallationId();
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

  private fetchSsoProviders() {
    this.service.ssoProviders$().subscribe(providers => this.providers = providers);
  }

  private fetchUserRoles() {
    this.service.getUserRoles$().subscribe(() => {
      if (this.firstTimeLogin) {
        this.router.navigate(['/changePassword']);
      } else {
        if (this.service.canAccess([SystemFunctionName.TOPIC_LIST])) {
          this.router.navigate(['/topics']);
        } else if (this.service.canAccess([SystemFunctionName.BROKERS_LIST])) {
          this.router.navigate(['/brokers']);
        }
      }
    });
  }

  private checkFirstTimeLogin(username: string) {
    this.service.firstTimeLogin$(username).subscribe(firstTime => {
      this.firstTimeLogin = firstTime;
      this.fetchUserRoles();
      this.fetchInstallationId();
    });
  }

  private fetchInstallationId() {
    this.service.getInstallationId$();
  }

  private fetchContextPath() {
    this.service.fetchContextPath$();
  }
}
