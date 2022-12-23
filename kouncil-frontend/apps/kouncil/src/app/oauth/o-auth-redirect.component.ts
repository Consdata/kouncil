import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {AuthService} from "../login/auth.service";

@Component({
  selector: 'app-oauth-redirect',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./o-auth-redirect.component.scss']
})
export class OAuthRedirectComponent implements OnInit{

  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    console.log('init')
    this.route.queryParams.subscribe(params=>{
      this.service.fetchToken(params['code'], params['state']).subscribe(data=>{
        this.service.updateToken(data['accessToken']);
        this.router.navigate(['/topics']);
      })
    })
  }
}
