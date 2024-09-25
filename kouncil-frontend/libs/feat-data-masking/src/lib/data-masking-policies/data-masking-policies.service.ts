import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Policy} from "../policy.model";

@Injectable()
export abstract class DataMaskingPoliciesService {

  abstract getPolicies$(): Observable<Array<Policy>>;
}
