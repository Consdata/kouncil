import {AuthService, SystemFunctionName} from '@app/common-auth';
import {Router} from '@angular/router';
import {SnackBarComponent, SnackBarData} from '@app/common-utils';
import {MatSnackBar} from '@angular/material/snack-bar';

export class LoginUtil {

  public static redirectUserAfterLogin(service: AuthService, router: Router, snackBar?: MatSnackBar): void {
    if (service.canAccess([SystemFunctionName.TOPIC_LIST])) {
      router.navigate(['/topics']);
    } else if (service.canAccess([SystemFunctionName.BROKERS_LIST])) {
      router.navigate(['/brokers']);
    } else if (service.canAccess([SystemFunctionName.CLUSTER_LIST])) {
      router.navigate(['/clusters']);
    } else if (service.canAccess([SystemFunctionName.USER_GROUPS_LIST])) {
      router.navigate(['/user-groups']);
    } else if (snackBar) {
      snackBar.openFromComponent(SnackBarComponent, {
        data: new SnackBarData('Access is denied', 'snackbar-error', 'Close'),
        panelClass: ['snackbar'],
        duration: 5000
      });
    } else {
      router.navigate(['/access-denied']);
    }
  }
}
