import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-change-password',
  template: `
    <app-common-change-password (changePasswordEvent)="changePassword($event)"
                                (skipChangeEvent)="skipChange()"
                                [iconContainerClass]="getIconContainerClass()"></app-common-change-password>
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
      this.router.navigate(['/topics']);
    });
  }

  skipChange(): void {
    this.service.skipChange$().subscribe(() => {
      this.router.navigate(['/topics']);
    });
  }

  getIconContainerClass(): string {
    return this.backend === 'SERVER' ? 'icon-login-container-desktop' : 'icon-login-container-demo';
  }
}
