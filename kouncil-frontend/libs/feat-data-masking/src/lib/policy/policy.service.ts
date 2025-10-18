import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export abstract class PolicyService {

  abstract deletePolicy$(id: number): Observable<void>;
}
