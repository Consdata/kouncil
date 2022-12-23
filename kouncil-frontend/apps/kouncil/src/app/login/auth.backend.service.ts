import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User} from '@app/common-login';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthBackendService implements AuthService {

  private IS_LOGGED_IN: string = 'isLoggedIn';
  private TOKEN: string = 'token';

  private authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    localStorage.getItem(this.IS_LOGGED_IN) === 'true'
    || (localStorage.getItem(this.TOKEN) != null && localStorage.getItem(this.TOKEN).length > 0)
  );

  constructor(protected http: HttpClient) {
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
      localStorage.setItem(this.IS_LOGGED_IN, 'true');
      return data;
    }));
  }

  logout$(): Observable<void> {
    return this.http.get<void>('/api/logout').pipe(map(() => {
      localStorage.removeItem(this.IS_LOGGED_IN);
      localStorage.removeItem(this.TOKEN);
      this.setAuthenticated(false);
    }));
  }

  github(): Observable<void> {
    window.open('http://localhost:8080/oauth2/authorization/github', '_self');
    return of(undefined);
  }

  updateToken(token: string): void {
    localStorage.setItem(this.TOKEN, token);
  }

  fetchToken(code, state): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/login/oauth2/code/github?code=${code}&state=${state}`).pipe(map(data=>{
      this.setAuthenticated(true)
      return data;
    }))
  }

  getToken(): string {
    return localStorage.getItem(this.TOKEN);
  }

  changeDefaultPassword$(newPassword: string): Observable<void> {
    return this.http.post<void>('/api/changeDefaultPassword', newPassword);
  }

  firstTimeLogin$(): Observable<boolean> {
    return this.http.get<boolean>('/api/firstTimeLogin').pipe(map(isFirstTime => {
      return isFirstTime;
    }));
  }

  skipChange$(): Observable<void> {
    return this.http.get<void>('/api/skipChangeDefaultPassword');
  }
}
