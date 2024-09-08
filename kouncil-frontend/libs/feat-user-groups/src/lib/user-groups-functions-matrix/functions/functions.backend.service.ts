import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FunctionsService} from './functions.service';
import {SystemFunction} from '../user-groups.model';

@Injectable({
  providedIn: 'root'
})
export class FunctionsBackendService implements FunctionsService {

  constructor(private http: HttpClient) {
  }

  getFunctions$(): Observable<Array<SystemFunction>> {
    return this.http.get<Array<SystemFunction>>('/api/functions');
  }
}
