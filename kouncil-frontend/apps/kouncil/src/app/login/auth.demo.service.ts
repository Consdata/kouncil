import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {User} from '@app/common-login';

@Injectable()
export class AuthDemoService implements AuthService {

  private IS_LOGGED_IN: string ='isLoggedIn';

  private authenticated: boolean = localStorage.getItem(this.IS_LOGGED_IN) === 'true';

  get isAuthenticated$(): Observable<boolean> {
    return of(this.authenticated);
  }

  login$(user: User): Observable<boolean> {
    this.authenticated = (user.username.length > 0 && user.password.length > 0);
    localStorage.setItem(this.IS_LOGGED_IN, 'true');
    return of(true);
  }

  logout$(): Observable<void> {
    this.authenticated = false;
    localStorage.removeItem(this.IS_LOGGED_IN);
    return of(undefined);
  }
}
