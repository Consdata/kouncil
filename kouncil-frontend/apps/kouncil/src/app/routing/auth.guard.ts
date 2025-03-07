import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService, SystemFunctionName } from '@app/common-auth';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(public router: Router, private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(map(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['login']);
        return false;
      }
      if (route.data['roles'] !== undefined) {
        const haveAccess = this.authService.canAccess(route.data['roles'] as Array<SystemFunctionName>);
        if (!haveAccess) {
          this.router.navigate(['/access-denied']);
        }
        return haveAccess;
      }
      return true;
    }));
  }
}
