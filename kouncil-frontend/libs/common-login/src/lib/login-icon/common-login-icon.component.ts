import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-common-login-icon',
  template: `
    <div class="icon-login-container" [ngClass]="iconContainerClass">
      <mat-icon aria-hidden="false" class="material-symbols-outlined icon-login">person</mat-icon>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-login-icon.component.scss']
})
export class CommonLoginIconComponent {

  @Input() iconContainerClass: string;

  constructor() {
  }

}
