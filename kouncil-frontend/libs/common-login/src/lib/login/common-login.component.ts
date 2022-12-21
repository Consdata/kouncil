import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./user";

@Component({
  selector: 'app-common-login',
  template: `
    <div class="icon-login-container">
      <mat-icon aria-hidden="false" class="icon-login">person</mat-icon>
    </div>
    <div class="main-login">
      <form (ngSubmit)="login()" class="login-form" [formGroup]="form">
        <span class="login-info">Log in to your account</span>

        <div class="login-field-container">
          <div class="login-field-icon-container">
            <mat-icon class="login-field-icon">person</mat-icon>
          </div>
          <div class="login-field-input-container">
            <input placeholder="Login" class="input" matInput type="text" required
                   [formControl]="getControl('username')">
          </div>
        </div>
        <br>

        <div class="login-field-container">
          <div class="login-field-icon-container">
            <mat-icon class="login-field-icon">lock</mat-icon>
          </div>
          <div class="login-field-input-container">
            <input placeholder="Password" class="input" matInput type="password" required
                   [formControl]="getControl('password')">
          </div>
        </div>
        <br>
        <button mat-button disableRipple class="action-button-white" type="submit">
          Login
        </button>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-login.component.scss']
})
export class CommonLoginComponent {

  form: FormGroup;
  @Output() loginUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.form.addControl('username', new FormControl('', Validators.required));
    this.form.addControl('password', new FormControl('', Validators.required));
  }

  login(): void {
    if (this.form.valid) {
      this.loginUser.emit(new User(this.getControl('username').value, this.getControl('password').value));
    }
  }

  getControl(name: string): FormControl {
    return this.form.controls[name] as FormControl;
  }
}
