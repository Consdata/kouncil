import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Policy} from '../policy.model';

@Injectable()
export abstract class PolicyService {

  abstract deletePolicy$(id: number): Observable<void>;

  abstract addNewPolicy$(model: Policy): Observable<void>;

  abstract updatePolicy$(model: Policy): Observable<void>;

  abstract getPolicyById$(policyId: number): Observable<Policy>;
}
