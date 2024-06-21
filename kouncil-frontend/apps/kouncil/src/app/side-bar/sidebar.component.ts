import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService, KouncilRole} from '@app/common-auth';
import {SidebarService} from "./sidebar.service";

@Component({
  selector: 'app-kafka-sidebar',
  template: `
    <div class="sidenav" [ngClass]="(currentState$ | async) ? 'opened' : 'closed'">
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/topics']" matTooltip="{{(currentState$ | async) ? '' : 'Topics'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">topic</mat-icon>
        <span *ngIf="(currentState$ | async)">Topics</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/brokers']"
         matTooltip="{{(currentState$ | async) ? '' : 'Brokers'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
        <mat-icon class="material-symbols-outlined">hub</mat-icon>
        <span *ngIf="(currentState$ | async)">Brokers</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/consumer-groups']"
         matTooltip="{{(currentState$ | async) ? '' : 'Consumer Groups'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
        <mat-icon class="material-symbols-outlined">device_hub</mat-icon>
        <span *ngIf="(currentState$ | async)">Consumer Groups</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/track']"
         matTooltip="{{(currentState$ | async) ? '' : 'Track'}}" matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">manage_search</mat-icon>
        <span *ngIf="(currentState$ | async)">Track</span>
      </a>
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/schemas']"
         matTooltip="{{(currentState$ | async) ? '' : 'Schema Registry'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
        <mat-icon class="material-symbols-outlined">code</mat-icon>
        <span *ngIf="(currentState$ | async)">Schema Registry</span>
      </a>

      <div style="width: 100%; height: 32px">
        <button mat-icon-button
                style="bottom: 20px; right: 0; position: absolute;"
                (click)="changeState()">
          <mat-icon style="margin: 0" class="material-symbols-outlined">
            {{ (currentState$ | async) ? 'dock_to_right' : 'dock_to_left' }}
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
  currentState$: Observable<boolean> = this.sidebarService.isOpened;
  @HostBinding('class') hostClass: string = 'opened';

  constructor(public authService: AuthService,
              private sidebarService: SidebarService) {
    this.sidebarService.isOpened.subscribe(isOpened=>{
      if(isOpened){
          this.hostClass = 'opened';
      } else {
          this.hostClass = 'closed';
      }
    })
  }

  changeState(): void {
    this.sidebarService.changeState();
  }
}
