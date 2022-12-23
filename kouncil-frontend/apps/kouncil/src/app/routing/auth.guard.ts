import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../login/auth.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public router: Router, private authService: AuthService) {
  }

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(map(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['login']);
        return false;
      }
      return true;
    }));
  }
}
