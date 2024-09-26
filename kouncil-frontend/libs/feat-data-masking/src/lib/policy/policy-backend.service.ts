import {Injectable} from '@angular/core';
import {PolicyService} from './policy.service';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PolicyBackendService implements PolicyService {

  constructor(private http: HttpClient) {
  }

  deletePolicy$(id: number): Observable<void> {
    return this.http.delete<void>(`/api/policy/${id}`);
  }

}
