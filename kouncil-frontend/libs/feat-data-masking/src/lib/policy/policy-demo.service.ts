import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {PolicyService} from './policy.service';

@Injectable({
  providedIn: 'root'
})
export class PolicyDemoService implements PolicyService {

  deletePolicy$(id: number): Observable<void> {
    return of();
  }

}
