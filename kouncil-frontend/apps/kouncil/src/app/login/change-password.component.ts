import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService, KouncilRole} from '@app/common-auth';
import {Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

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
      if (this.service.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])) {
        this.router.navigate(['/topics']);
      } else if (this.service.canAccess([KouncilRole.KOUNCIL_ADMIN])) {
        this.router.navigate(['/brokers']);
      }
    });
  }

  skipChange(): void {
    this.service.skipChange$().subscribe(() => {
      if (this.service.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])) {
        this.router.navigate(['/topics']);
      } else if (this.service.canAccess([KouncilRole.KOUNCIL_ADMIN])) {
        this.router.navigate(['/brokers']);
      }
    });
  }

  getIconContainerClass(): string {
    return this.backend === 'SERVER' ? 'icon-login-container-desktop' : 'icon-login-container-demo';
  }
}
