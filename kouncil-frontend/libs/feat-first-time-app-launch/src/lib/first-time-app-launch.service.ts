import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export abstract class FirstTimeAppLaunchService {

  abstract arePermissionsNotDefined$(): Observable<boolean>;

  abstract confirmTemporaryAccessToApp(): void;
}
