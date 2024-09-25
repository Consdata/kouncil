import {Injectable} from '@angular/core';
import {DataMaskingPoliciesService} from './data-masking-policies.service';
import {Observable} from "rxjs";
import {Policy} from "../policy.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class DataMaskingPoliciesBackendService implements DataMaskingPoliciesService {

  constructor(private http: HttpClient) {
  }

  getPolicies$(): Observable<Array<Policy>> {
    return this.http.get<Array<Policy>>('/api/policies')
  }

}
