import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied-main">
      <mat-icon aria-hidden="false" class="lock-icon">lock</mat-icon>
      <span class="access-denied-title">Access denied.</span>
      <span class="access-denied-text">You currently does not have access to this page.</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {

}
