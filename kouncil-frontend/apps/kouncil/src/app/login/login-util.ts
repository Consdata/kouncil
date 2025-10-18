import {AuthService, SystemFunctionName} from '@app/common-auth';
import {Router} from '@angular/router';

export class LoginUtil {

  public static redirectUserAfterLogin(service: AuthService, router: Router): void {
    if (service.canAccess([SystemFunctionName.TOPIC_LIST])) {
      router.navigate(['/topics']);
    } else if (service.canAccess([SystemFunctionName.BROKERS_LIST])) {
      router.navigate(['/brokers']);
    } else if (service.canAccess([SystemFunctionName.CLUSTER_LIST])) {
      router.navigate(['/clusters']);
    } else if (service.canAccess([SystemFunctionName.USER_GROUPS_LIST])) {
      router.navigate(['/user-groups']);
    } else {
      router.navigate(['/access-denied']);
    }
  }
}
