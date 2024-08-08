import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SystemFunction} from '../user-groups.model';
import {FunctionsService} from './functions.service';

@Injectable({
  providedIn: 'root',
})
export class FunctionsDemoService implements FunctionsService {

  getFunctions$(): Observable<Array<SystemFunction>> {
    return of();
  }
}
