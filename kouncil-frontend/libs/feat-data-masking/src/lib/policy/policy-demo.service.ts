import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PolicyService} from './policy.service';
import {Policy} from '../policy.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyDemoService implements PolicyService {

  deletePolicy$(_id: number): Observable<void> {
    return of();
  }

  addNewPolicy$(_model: Policy): Observable<void> {
    return of();
  }

  updatePolicy$(_model: Policy): Observable<void> {
    return of();
  }

  getPolicyById$(_policyId: number): Observable<Policy> {
    return of();
  }

}
