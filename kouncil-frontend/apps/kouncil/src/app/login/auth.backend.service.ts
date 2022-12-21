import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '@app/common-login';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthBackendService implements AuthService{

  private authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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
      return data;
    }));
  }

  logout$(): Observable<void> {
    return this.http.get<void>('/api/logout').pipe(map(() => {
      this.setAuthenticated(false);
    }));
  }
}
