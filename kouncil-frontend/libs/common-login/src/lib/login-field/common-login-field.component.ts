import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-common-login-field',
  template: `
    <div #loginField class="login-field-container"
         [ngClass]="{'login-field-container-error': isFieldInvalid()}">
      <div class="login-field-icon-container">
        <mat-icon class="login-field-icon">{{ icon }}</mat-icon>
      </div>
      <div class="login-field-input-container">
        <input [placeholder]="label" class="input" matInput [type]="fieldType" required
               [formControl]="control" (focusin)="updateFocus(loginField)"
               (focusout)="updateFocus(loginField)" [autocomplete]="autocomplete">
      </div>
    </div>
    <mat-error class="error" *ngIf="isFieldInvalid()">
      Field is <strong>required</strong>
    </mat-error>
    <br>
  `,
  styleUrls: ['./common-login-field.component.scss']
})
export class CommonLoginFieldComponent {

  @Input() fieldName: string;
  @Input() control: FormControl;
  @Input() fieldType: 'text' | 'password';
  @Input() autocomplete: string;
  @Input() label: string;
  @Input() icon: string;

  constructor() {
  }

  updateFocus(htmlElement: HTMLElement): void {
    if (htmlElement.classList.contains('input-focus')) {
      htmlElement.classList.remove('input-focus');
    } else {
      htmlElement.classList.add('input-focus');
    }
  }

  isFieldInvalid(): boolean {
    return this.control.touched && this.control.invalid;
  }
}
