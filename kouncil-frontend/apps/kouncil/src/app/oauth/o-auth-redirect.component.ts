import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {AuthService, SystemFunctionName} from '@app/common-auth';

@Component({
  selector: 'app-oauth-redirect',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./o-auth-redirect.component.scss']
})
export class OAuthRedirectComponent implements OnInit {

  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.fetchToken(params);
    });
  }

  private fetchToken(params: Params) {
    this.service.fetchToken$(params['code'], params['state'], localStorage.getItem('selectedProvider')).subscribe(() => {
      this.fetchUserRoles();
    });
  }

  private fetchUserRoles() {
    this.service.getUserRoles$().subscribe(() => {
      if (this.service.canAccess([SystemFunctionName.TOPIC_LIST])) {
        this.router.navigate(['/topics']);
      } else if (this.service.canAccess([SystemFunctionName.BROKERS_LIST])) {
        this.router.navigate(['/brokers']);
      } else {
        this.router.navigate(['/access-denied']);
      }
    });
  }
}
