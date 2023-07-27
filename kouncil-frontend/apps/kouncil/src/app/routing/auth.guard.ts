import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from '../login/auth.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {KouncilRole} from '../login/kouncil-role';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public router: Router, private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(map(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['login']);
        return false;
      }
      if (route.data['roles'] !== undefined) {
        const haveAccess = this.authService.canAccess(route.data['roles'] as Array<KouncilRole>);
        if (!haveAccess) {
          this.router.navigate(['/access-denied']);
        }
        return haveAccess;
      }
      return true;
    }));
  }
}
