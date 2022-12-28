import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {Router} from '@angular/router';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';
import {User} from '@app/common-login';

@Component({
  selector: 'app-login',
  template: `
    <app-demo *ngIf="backend === 'DEMO'"></app-demo>
    <app-kafka-navbar></app-kafka-navbar>

    <div [ngClass]="backend === 'SERVER' ? 'kafka-desktop' : 'kafka-desktop-demo'">
      <app-common-login (loginUser)="login($event)"></app-common-login>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public backend: Backend = environment.backend;

  constructor(private service: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.service.clearLoggedIn();
  }

  login($event: User): void {
    this.service.login$($event).subscribe(isValid => {
      if (isValid) {
        this.router.navigate(['/topics']);
      }
    });
  }
}
