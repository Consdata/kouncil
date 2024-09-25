import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {DataMaskingPoliciesService} from './data-masking-policies.service';
import {Policy} from "../policy.model";

@Injectable({
  providedIn: 'root'
})
export class DataMaskingPoliciesDemoService implements DataMaskingPoliciesService {

  getPolicies$(): Observable<Array<Policy>> {
    return of();
  }

}
