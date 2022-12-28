import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "./user";
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from './user';
import {Backend} from '@app/common-model';
import {SSOProvider} from './sso-provider';

@Component({
  selector: 'app-common-login',
  template: `
    <div class="main-login">
      <form (ngSubmit)="login()" class="login-form" [formGroup]="form">
        <span class="login-info">Log in to your account</span>

        <ng-content select="[info]"></ng-content>

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

    <div class="sso-container" *ngIf="availableProviders && availableProviders.length >0">
      <div class="sso-label-container">
        <div class="divider divider-left"></div>
        <span class="sso-label">OR SIGN IN WITH</span>
        <div class="divider divider-right"></div>
      </div>
      <ng-container *ngFor="let provider of availableProviders">
        <button mat-button type="button" (click)="sso(getProviderData(provider).name)"
                class="sso-button">
          <img [src]="getProviderData(provider).icon" class="sso-provider-icon"
               [title]="getProviderData(provider).title" alt="logo">
        </button>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./common-login.component.scss']
})
export class CommonLoginComponent {

  form: FormGroup;
  @Input() backend: Backend;
  @Input() availableProviders: Array<string>;
  @Input() firstTimeLogin: boolean = false;
  @Output() loginUser: EventEmitter<User> = new EventEmitter<User>();
  @Output() ssoEvent: EventEmitter<string> = new EventEmitter<string>();

  private supportedProviders: Map<string, SSOProvider> = new Map<string, SSOProvider>([
    ['github', {name: 'github', icon: '/assets/github-mark.svg', title: 'GitHub'}],
  ]);

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

  sso(provider: string) {
    this.ssoEvent.emit(provider);
  }

  getProviderData(provider: string) {
    return this.supportedProviders.get(provider);
  }
}
