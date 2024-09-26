import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PoliciesService} from './policies.service';
import {Policy} from "../policy.model";

@Injectable({
  providedIn: 'root'
})
export class PoliciesDemoService implements PoliciesService {

  getPolicies$(): Observable<Array<Policy>> {
    return of();
  }

}
