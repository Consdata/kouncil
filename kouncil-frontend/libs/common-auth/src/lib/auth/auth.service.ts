import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '@app/common-login';
import {SystemFunctionName} from './system-function-name';

@Injectable()
export abstract class AuthService {

  abstract get isAuthenticated$(): Observable<boolean>;

  abstract login$(user: User): Observable<boolean>;

  abstract logout$(): Observable<void>;

  abstract activeProvider$(): Observable<string>;

  abstract ssoProviders$(): Observable<Array<string>>;

  abstract sso$(provider: string): Observable<void>;

  abstract fetchToken$(code: string, state: string, provider: string): Observable<void>;

  abstract clearLoggedIn(): void;

  abstract firstTimeLogin$(username: string): Observable<boolean>;

  abstract changeDefaultPassword$(newPassword: string): Observable<void>;

  abstract skipChange$(): Observable<void>;

  abstract getUserRoles$(): Observable<void>;

  abstract canAccess(roles: SystemFunctionName[]): boolean;
  abstract getInstallationId$(): void;
  abstract fetchContextPath$(): void;
}
