import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuthService} from './auth.service';
import {User} from '@app/common-login';
import {KouncilRole} from './kouncil-role';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class AuthDemoService implements AuthService {

  private readonly IS_LOGGED_IN: string = 'isLoggedIn';
  private readonly USER_ROLES: string = 'userRoles';
  private userRoles: Array<KouncilRole> = JSON.parse(localStorage.getItem(this.USER_ROLES));

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

  firstTimeLogin$(_username: string): Observable<boolean> {
    return of(false);
  }

  skipChange$(): Observable<void> {
    return of(undefined);
  }

  sso$(_provider: string): Observable<void> {
    return of(undefined);
  }

  fetchToken$(_code: string, _state: string, _provider: string): Observable<void> {
    return of(undefined);
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

  getUserRoles$(): Observable<void> {
    this.userRoles = new Array<KouncilRole>(KouncilRole.KOUNCIL_ADMIN, KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER);
    localStorage.setItem(this.USER_ROLES, JSON.stringify(this.userRoles));
    return of(undefined);
  }

  canAccess(roles: KouncilRole[]): boolean {
    const localStorageUserRoles = JSON.parse(localStorage.getItem(this.USER_ROLES));
    if (this.userRoles.length === 0 && localStorageUserRoles.length > 0) {
      this.userRoles = localStorageUserRoles;
    }
    return this.userRoles.some(userRole => roles.includes(userRole));
  }

  getInstallationId$(): void {
    localStorage.setItem('installationId',uuidv4());
  }

  fetchContextPath$(): void {
  }
}
