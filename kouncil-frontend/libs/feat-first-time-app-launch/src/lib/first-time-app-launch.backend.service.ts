import {FirstTimeAppLaunchService} from './first-time-app-launch.service';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {AuthService, LoggedInUserUtil} from '@app/common-auth';
import {ConfirmService} from '@app/feat-confirm';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FirstTimeAppLaunchBackendService implements FirstTimeAppLaunchService {

  constructor(private http: HttpClient, private confirmService: ConfirmService,
              private auth: AuthService, private router: Router) {
  }

  arePermissionsNotDefined$(): Observable<boolean> {
    return this.http.get<boolean>('/api/permissions-not-defined').pipe(map((value) => {
      return value;
    }));
  }

  public confirmTemporaryAccessToApp(): void {
    this.confirmService.openConfirmDialog$({
      title: 'Temporary access to application',
      subtitle: 'User groups and permissions are not defined. You will be logged in as a temporary user with access to define them.'
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.createTemporaryAdminUser();
      }
    });
  }

  private createTemporaryAdminUser(): void {
    this.http.post('/api/create-temporary-admin', {}).subscribe(() => {
      this.auth.markUserAsLoggedIn(true);
      this.fetchUserGroups();
    });
  }

  private fetchUserGroups(): void {
    this.auth.getUserRoles$().subscribe(() => {
      this.router.navigate(['/user-groups']);
      LoggedInUserUtil.temporaryAdminLoggedIn();
    });
  }

}
