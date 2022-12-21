import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {User} from '@app/common-login';

@Injectable()
export class AuthDemoService implements AuthService {

  private authenticated: boolean = false;

  get isAuthenticated$(): Observable<boolean> {
    return of(this.authenticated);
  }

  login$(user: User): Observable<boolean> {
    this.authenticated = (user.username.length > 0 && user.password.length > 0);
    return of(true);
  }

  logout$(): Observable<void> {
    this.authenticated = false;
    return of(undefined);
  }
}
