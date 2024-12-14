import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from '@app/common-auth';
import {Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {LoginUtil} from './login-util';

@Component({
  selector: 'app-change-password',
  template: `
    <app-common-login-icon *ngIf="this.backend === 'SERVER'"
                           [iconContainerClass]="'icon-login-container-desktop'"></app-common-login-icon>
    <app-common-login-icon *ngIf="this.backend === 'DEMO'"
                           [iconContainerClass]="'icon-login-container-demo'"></app-common-login-icon>

    <app-common-change-password (changePasswordEvent)="changePassword($event)"
                                (skipChangeEvent)="skipChange()"></app-common-change-password>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router) {
  }

  changePassword($event: string): void {
    this.service.changeDefaultPassword$($event).subscribe(() => {
      this.navigateToDefaultPage();
    });
  }

  skipChange(): void {
    this.service.skipChange$().subscribe(() => {
      this.navigateToDefaultPage();
    });
  }

  private navigateToDefaultPage(): void {
    LoginUtil.redirectUserAfterLogin(this.service, this.router);
  }
}
