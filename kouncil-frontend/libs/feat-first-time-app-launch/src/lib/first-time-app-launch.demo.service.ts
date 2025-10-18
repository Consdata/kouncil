import {FirstTimeAppLaunchService} from './first-time-app-launch.service';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirstTimeAppLaunchDemoService implements FirstTimeAppLaunchService {

  arePermissionsNotDefined$(): Observable<boolean> {
    return of(false);
  }

  confirmTemporaryAccessToApp(): void {
  }

}
