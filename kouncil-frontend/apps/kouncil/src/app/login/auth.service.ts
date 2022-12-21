import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  authenticated: boolean = false;

  constructor(protected http: HttpClient) {
  }

  login$(username: string, password: string): Observable<boolean> {
    return this.http.post<boolean>('/api/login', {
      username: username,
      password: password
    }).pipe(map(data => {
      this.authenticated = data;
      return data;
    }));
  }

  logout$(): Observable<void> {
    return this.http.get<void>('/api/logout').pipe(map(() => {
      this.authenticated = false;
    }));
  }
}
