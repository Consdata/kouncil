import {Injectable} from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {FirstTimeAppLaunchService} from '@app/feat-first-time-app-launch';

@Injectable({providedIn: 'root'})
export class PermissionsConfigResolver implements Resolve<boolean> {

  constructor(private firstTimeAppLaunchService: FirstTimeAppLaunchService) {
  }

  resolve(): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise<boolean>((resolve) => {
      resolve(true);
      this.firstTimeAppLaunchService.arePermissionsNotDefined$().subscribe(result => {
        if (result) {
          this.firstTimeAppLaunchService.confirmTemporaryAccessToApp();
        }
      });
    });
  }
}
