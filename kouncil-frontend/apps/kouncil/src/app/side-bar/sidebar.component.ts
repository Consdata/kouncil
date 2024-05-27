import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService, KouncilRole} from '@app/common-auth';

@Component({
  selector: 'app-kafka-sidebar',
  template: `
    <div class="sidenav" [ngClass]="currentState">
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/topics']" matTooltip="{{currentState === 'opened' ? '' : 'Topics'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">topic</mat-icon>
        <span *ngIf="currentState === 'opened'">Topics</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/brokers']"
         matTooltip="{{currentState === 'opened' ? '' : 'Brokers'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
        <mat-icon class="material-symbols-outlined">hub</mat-icon>
        <span *ngIf="currentState === 'opened'">Brokers</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/consumer-groups']"
         matTooltip="{{currentState === 'opened' ? '' : 'Consumer Groups'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
        <mat-icon class="material-symbols-outlined">device_hub</mat-icon>
        <span *ngIf="currentState === 'opened'">Consumer Groups</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/track']"
         matTooltip="{{currentState === 'opened' ? '' : 'Track'}}" matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">manage_search</mat-icon>
        <span *ngIf="currentState === 'opened'">Track</span>
      </a>
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/schemas']"
         matTooltip="{{currentState === 'opened' ? '' : 'Schema Registry'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">code</mat-icon>
        <span *ngIf="currentState === 'opened'">Schema Registry</span>
      </a>

      <div style="width: 100%; height: 32px">
        <button mat-icon-button
                style="bottom: 20px; right: 0; position: absolute;"
                (click)="changeState()">
          <mat-icon style="margin: 0" class="material-symbols-outlined">
            {{ currentState === 'opened' ? 'dock_to_right' : 'dock_to_left' }}
          </mat-icon>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  KouncilRole: typeof KouncilRole = KouncilRole;

  isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;

  currentState: string = 'opened';
  @HostBinding('class') hostClass: string = 'opened';

  constructor(public authService: AuthService) {
  }

  changeState(): void {
    if (this.currentState === 'opened') {
      this.currentState = 'closed';
      this.hostClass = 'closed';
    } else if (this.currentState === 'closed') {
      this.currentState = 'opened';
      this.hostClass = 'opened';
    }
  }
}
