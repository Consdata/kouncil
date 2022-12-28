import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {User} from '@app/common-login';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  template: `
    <app-common-login (loginUser)="login($event)" [iconContainerClass]="getIconContainerClass()"
                      [firstTimeLogin]="firstTimeLogin"></app-common-login>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  firstTimeLogin: boolean = false;
  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router) {
  }

  ngAfterViewInit(): void {
    this.service.firstTimeLogin$().subscribe(firstTime => {
      this.firstTimeLogin = firstTime;
    });
  }

  ngOnInit(): void {
    this.service.clearLoggedIn();
  }

  login($event: User): void {
    this.service.login$($event).subscribe(isValid => {
      if (isValid) {
        if (this.firstTimeLogin) {
          this.router.navigate(['/changePassword']);
        } else {
          this.router.navigate(['/topics']);
        }
      }
    });
  }

  getIconContainerClass(): string {
    return this.backend === 'SERVER' ? 'icon-login-container-desktop' : 'icon-login-container-demo';
  }
}
