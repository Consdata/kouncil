import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {User} from '@app/common-login';

@Injectable()
export class AuthDemoService implements AuthService {

  private IS_LOGGED_IN: string = 'isLoggedIn';

  private authenticated: boolean = localStorage.getItem(this.IS_LOGGED_IN) === 'true';

  get isAuthenticated$(): Observable<boolean> {
    return of(this.authenticated);
  }

  login$(_user: User): Observable<boolean> {
    this.authenticated = true;
    localStorage.setItem(this.IS_LOGGED_IN, 'true');
    return of(true);
  }

  logout$(): Observable<void> {
    this.authenticated = false;
    localStorage.removeItem(this.IS_LOGGED_IN);
    return of(undefined);
  }

  changeDefaultPassword$(_newPassword: string): Observable<void> {
    return of(undefined);
  }

  firstTimeLogin$(): Observable<boolean> {
    return of(false);
  }

  skipChange$(): Observable<void> {
    return of(undefined);
  }

  sso$(_provider: string): Observable<void> {
    return of(undefined);
  }

  fetchToken$(_code: string, _state: string, _provider: string): Observable<string> {
    return of('token');
  }

  getToken(): string {
    return '';
  }

  updateToken(_token: string): void {
  }

  ssoProviders$(): Observable<Array<string>> {
    return of([]);
  }

  clearLoggedIn(): void {
    localStorage.removeItem(this.IS_LOGGED_IN);
    this.authenticated = false;
  }

  activeProvider$(): Observable<string> {
    return of('inmemory');
  }
}
