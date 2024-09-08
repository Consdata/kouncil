import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SystemFunction} from '../user-groups.model';

@Injectable()
export abstract class FunctionsService {

  abstract getFunctions$(): Observable<Array<SystemFunction>>;
}
