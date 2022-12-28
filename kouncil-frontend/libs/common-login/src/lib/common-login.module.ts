import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {CommonLoginFieldComponent} from "./login-field/common-login-field.component";
import {CommonChangePasswordComponent} from "./change-password/common-change-password.component";
import {CommonLoginIconComponent} from "./login-icon/common-login-icon.component";
import {CommonLoginComponent} from "./login/common-login.component";

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  declarations: [
    CommonLoginComponent,
    CommonLoginFieldComponent,
    CommonChangePasswordComponent,
    CommonLoginIconComponent
  ],
  exports: [
    CommonLoginComponent,
    CommonChangePasswordComponent,
    CommonLoginIconComponent
  ]
})
export class CommonLoginModule {
}
