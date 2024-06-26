import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-common-change-password',
  template: `
    <div class="main-login">
      <form class="login-form" [formGroup]="form" (ngSubmit)="changePassword()">
        <span class="login-info">First login password change</span>

        <app-common-login-field [fieldName]="'new-password'"
                                [control]="getControl('new-password')"
                                [fieldType]="'password'"
                                [autocomplete]="'new-password'"
                                [label]="'Password'"
                                [icon]="'lock'"></app-common-login-field>

        <app-common-login-field [fieldName]="'confirm-password'"
                                [control]="getControl('confirm-password')"
                                [fieldType]="'password'"
                                [autocomplete]="'confirm-password'"
                                [label]="'Confirm password'"
                                [icon]="'lock'"></app-common-login-field>

        <mat-error class="error" *ngIf="passwordNotMatch">Password did not match</mat-error>

        <button mat-button disableRipple class="action-button-white" type="submit">
          Change password
        </button>

        <a class="skip-change" (click)="skipChange()">
          Skip
        </a>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-change-password.component.scss']
})
export class CommonChangePasswordComponent {

  form: FormGroup;
  passwordNotMatch: boolean = false;
  @Output() changePasswordEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() skipChangeEvent: EventEmitter<void> = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.form.addControl('new-password', new FormControl('', Validators.required));
    this.form.addControl('confirm-password', new FormControl('', Validators.required));
  }

  getControl(controlName: string): FormControl {
    return this.form.controls[controlName] as FormControl;
  }

  changePassword(): void {
    if (this.getControl('new-password').getRawValue() !== this.getControl('confirm-password').getRawValue()) {
      this.passwordNotMatch = true;
    } else {
      if (this.form.valid) {
        this.changePasswordEvent.emit(this.getControl('new-password').getRawValue());
      }
    }
  }

  skipChange(): void {
    this.skipChangeEvent.emit();
  }
}
