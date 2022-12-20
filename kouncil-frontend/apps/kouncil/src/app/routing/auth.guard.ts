import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {LoginService} from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router, private loginService: LoginService) {
  }

  canActivate(): boolean {
    if (!this.loginService.authenticated) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
