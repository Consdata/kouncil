import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-common-login-icon',
  template: `
    <div class="icon-login-main-container">
      <div class="icon-login-container">
        <mat-icon aria-hidden="false" class="material-symbols-outlined icon-login">person</mat-icon>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-login-icon.component.scss']
})
export class CommonLoginIconComponent {

  constructor() {
  }
}
