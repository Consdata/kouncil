import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User} from '@app/common-login';
import {AuthService} from './auth.service';
import {SystemFunctionName} from './system-function-name';
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class AuthBackendService implements AuthService {

  private readonly IS_LOGGED_IN: string = 'isLoggedIn';
  private readonly USER_ROLES: string = 'userRoles';
  private readonly USER_ID: string = 'userId';
  private readonly INSTALLATION_ID: string = 'installationId';
  private userRoles: Array<SystemFunctionName> = [];

  private readonly baseUrl: string;
  private contextPath: string;

  private authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(localStorage.getItem(this.IS_LOGGED_IN) === 'true');

  constructor(protected http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.authenticated$.asObservable();
  }

  setAuthenticated(isAuthenticated: boolean): void {
    this.authenticated$.next(isAuthenticated);
  }

  login$(user: User): Observable<boolean> {
    return this.http.post<boolean>('/api/login', user).pipe(map(data => {
      this.setAuthenticated(data);
      localStorage.setItem(this.IS_LOGGED_IN, data.toString());
      this.generateUserId();
      return data;
    }));
  }

  logout$(): Observable<void> {
    return this.http.get<void>('/api/logout').pipe(map(() => {
      localStorage.removeItem(this.IS_LOGGED_IN);
      this.setAuthenticated(false);
    }));
  }

  sso$(provider: string): Observable<void> {
    window.open(`${this.baseUrl}/oauth2/authorization/${provider}`, '_self');
    localStorage.setItem('selectedProvider', provider);
    return of(undefined);
  }

  fetchToken$(code: string, state: string, provider: string): Observable<void> {
    return this.http.get<void>(`/login/oauth2/code/${provider}?code=${code}&state=${state}`).pipe(map(() => {
      this.setAuthenticated(true);
      localStorage.setItem(this.IS_LOGGED_IN, 'true');
      localStorage.removeItem('selectedProvider');
    }));
  }

  changeDefaultPassword$(newPassword: string): Observable<void> {
    return this.http.post<void>('/api/change-default-password', newPassword);
  }

  firstTimeLogin$(username: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/first-time-login/${username}`).pipe(map(isFirstTime => {
      return isFirstTime;
    }));
  }

  skipChange$(): Observable<void> {
    return this.http.get<void>('/api/skip-change-default-password');
  }

  clearLoggedIn(): void {
    localStorage.removeItem(this.IS_LOGGED_IN);
    this.setAuthenticated(false);
  }

  ssoProviders$(): Observable<Array<string>> {
    return this.http.get<Array<string>>('/api/sso-providers').pipe(map((providers) => {
      return providers;
    }));
  }

  activeProvider$(): Observable<string> {
    return this.http.get('/api/active-provider', {responseType: 'text'}).pipe(map((providers) => {
      return providers;
    }));
  }

  getUserRoles$(): Observable<void> {
    return this.http.get<Array<SystemFunctionName>>('/api/user-roles').pipe(map((userRoles) => {
      this.userRoles = userRoles;
      localStorage.setItem(this.USER_ROLES, JSON.stringify(this.userRoles));
    }));
  }

  canAccess(roles: SystemFunctionName[]): boolean {
    const localStorageUserRoles = JSON.parse(localStorage.getItem(this.USER_ROLES));
    if (this.userRoles.length === 0 && localStorageUserRoles.length > 0) {
      this.userRoles = localStorageUserRoles;
    }
    return this.userRoles.some(userRole => roles.includes(userRole));
  }

  private generateUserId() {
    if (!localStorage.getItem(this.USER_ID)) {
      localStorage.setItem(this.USER_ID, uuidv4());
    }
  }

  getInstallationId$(): void {
    this.http.get('/api/installation-id', {responseType: 'text'}).subscribe((installationId) => {
      localStorage.setItem(this.INSTALLATION_ID, installationId);
    });
  }

  fetchContextPath$(): void {
    this.http.get('/api/context-path', {responseType: 'text'}).subscribe((contextPath) => {
      this.contextPath = contextPath;
    });
  }
}
