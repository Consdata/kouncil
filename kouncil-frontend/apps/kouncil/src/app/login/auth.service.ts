import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {User} from '@app/common-login';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '@app/common-model';
import {AuthBackendService} from './auth.backend.service';
import {AuthDemoService} from './auth.demo.service';
import {KouncilRole} from './kouncil-role';

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

  abstract canAccess(roles: KouncilRole[]): boolean;
  abstract getInstallationId$(): void;
}

export function authServiceFactory(http: HttpClient): AuthService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new AuthBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new AuthDemoService();
  }
}
