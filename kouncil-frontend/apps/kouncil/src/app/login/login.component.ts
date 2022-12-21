import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {configProviderFactory} from '../app.module';
import {ServersService} from '@app/common-servers';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-login',
  template: `
    <app-kafka-navbar></app-kafka-navbar>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <div class="icon-login-container">
        <mat-icon aria-hidden="false" class="icon-login">person</mat-icon>
      </div>
      <div class="main-login">
        <form (ngSubmit)="login()" class="login-form" [formGroup]="form">

          <div class="login-field-container">
            <div class="login-field-icon-container">
              <mat-icon class="login-field-icon">person</mat-icon>
            </div>
            <div class="login-field-input-container">
              <input placeholder="Login" class="input" matInput type="text"
                     [formControl]="getControl('username')">
            </div>
          </div>
          <br>

          <div class="login-field-container">
            <div class="login-field-icon-container">
              <mat-icon class="login-field-icon">lock</mat-icon>
            </div>
            <div class="login-field-input-container">
              <input placeholder="Password" class="input" matInput type="password"
                     [formControl]="getControl('password')">
            </div>
          </div>
          <br>
          <button mat-button disableRipple class="action-button-white" type="submit">
            Login
          </button>
        </form>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public backend: Backend = environment.backend;
  form: FormGroup;

  constructor(private service: AuthService, private router: Router, private serverService: ServersService,
              private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.form.addControl('username', new FormControl('', Validators.required));
    this.form.addControl('password', new FormControl('', Validators.required));
  }

  login(): void {
    if (this.form.valid) {
      this.service.login$(this.getControl('username').value, this.getControl('password').value).subscribe(isValid => {
        if (isValid) {
          configProviderFactory(this.serverService).then(() => {
            this.router.navigate(['/topics']);
          });
        }
      });
    }
  }

  getControl(name: string): FormControl {
    return this.form.controls[name] as FormControl;
  }
}
