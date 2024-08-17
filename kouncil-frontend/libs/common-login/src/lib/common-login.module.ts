import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonLoginFieldComponent} from './login-field/common-login-field.component';
import {CommonChangePasswordComponent} from './change-password/common-change-password.component';
import {CommonLoginIconComponent} from './login-icon/common-login-icon.component';
import {CommonLoginComponent} from './login/common-login.component';
import {CommonLoginSsoComponent} from './login-sso/common-login-sso.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    NgOptimizedImage
  ],
  declarations: [
    CommonLoginComponent,
    CommonLoginFieldComponent,
    CommonChangePasswordComponent,
    CommonLoginIconComponent,
    CommonLoginSsoComponent
  ],
  exports: [
    CommonLoginComponent,
    CommonChangePasswordComponent,
    CommonLoginIconComponent,
    CommonLoginSsoComponent
  ]
})
export class CommonLoginModule {
}
