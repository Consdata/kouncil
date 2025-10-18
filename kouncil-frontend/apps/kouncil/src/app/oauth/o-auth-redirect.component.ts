import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {AuthService} from '@app/common-auth';
import {LoginUtil} from '../login/login-util';

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

  private fetchToken(params: Params): void {
    this.service.fetchToken$(params['code'], params['state'], localStorage.getItem('selectedProvider')).subscribe(() => {
      this.fetchUserRoles();
    });
  }

  private fetchUserRoles(): void {
    this.service.getUserRoles$().subscribe(() => {
      LoginUtil.redirectUserAfterLogin(this.service, this.router);
    });
  }
}
