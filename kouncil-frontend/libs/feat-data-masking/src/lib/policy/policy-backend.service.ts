import {Injectable} from '@angular/core';
import {PolicyService} from './policy.service';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Policy} from '../policy.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyBackendService implements PolicyService {

  constructor(private http: HttpClient) {
  }

  addNewPolicy$(model: Policy): Observable<void> {
    return this.http.post<void>('/api/policy', model);
  }

  updatePolicy$(model: Policy): Observable<void> {
    return this.http.put<void>('/api/policy', model);
  }

  getPolicyById$(policyId: number): Observable<Policy> {
    return this.http.get<Policy>(`/api/policy/${policyId}`);
  }

  deletePolicy$(id: number): Observable<void> {
    return this.http.delete<void>(`/api/policy/${id}`);
  }
}
