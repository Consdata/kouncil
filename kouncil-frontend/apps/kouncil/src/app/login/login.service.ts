import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  authenticated: boolean = false;

  constructor(protected http: HttpClient) {
  }

  login$(username: string, password: string): Observable<boolean> {
    return this.http.post<boolean>('/api/login', {
      userName: username,
      password: password
    }).pipe(map(data => {
      this.authenticated = data;
      return data;
    }));
  }
}
