import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./user";
import {Backend} from "@app/common-model";

@Component({
  selector: 'app-common-login',
  template: `
    <div class="icon-login-container"
         [ngClass]="backend === 'SERVER' ? 'icon-login-container-desktop' : 'icon-login-container-demo'">
      <mat-icon aria-hidden="false" class="icon-login">person</mat-icon>
    </div>
    <div class="main-login">
      <form (ngSubmit)="login()" class="login-form" [formGroup]="form">
        <span class="login-info">Log in to your account</span>

        <span *ngIf="firstTimeLogin" class="first-time-login">
          Default user credentials:
          <br>
          username: admin
          <br>
          password: admin
        </span>

        <app-common-login-field [fieldName]="'username'"
                                [control]="getControl('username')"
                                [fieldType]="'text'"
                                [autocomplete]="'username'"
                                [label]="'Login'"
                                [icon]="'person'"></app-common-login-field>

        <app-common-login-field [fieldName]="'password'"
                                [control]="getControl('password')"
                                [fieldType]="'password'"
                                [autocomplete]="'current-password'"
                                [label]="'Password'"
                                [icon]="'lock'"></app-common-login-field>
        <button mat-button disableRipple class="action-button-white" type="submit">
          Login
        </button>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-login.component.scss', '../common-login.scss']
})
export class CommonLoginComponent {

  form: FormGroup;
  @Input() backend: Backend;
  @Input() firstTimeLogin: boolean = false;
  @Output() loginUser: EventEmitter<User> = new EventEmitter<User>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.form.addControl('username', new FormControl('', Validators.required));
    this.form.addControl('password', new FormControl('', Validators.required));
  }

  login(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.loginUser.emit({
          username: this.getControl('username').getRawValue(),
          password: this.getControl('password').getRawValue()
        }
      );
    }
  }

  getControl(controlName: string): FormControl {
    return this.form.controls[controlName] as FormControl;
  }
}
