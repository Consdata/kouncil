import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService, KouncilRole} from '@app/common-auth';
import {SidebarService} from './sidebar.service';
import {Backend} from '@app/common-model';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-kafka-sidebar',
  template: `
    <div class="sidenav"
         [ngClass]="{'opened': (currentState$ | async), 'closed': (currentState$| async) === false, 'sidenav-demo': backend === 'DEMO'}">
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/topics']" matTooltip="{{(currentState$ | async) ? '' : 'Topics'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.TOPIC_LIST])">
        <mat-icon class="material-symbols-outlined">topic</mat-icon>
        <span *ngIf="(currentState$ | async)">Topics</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/brokers']"
         matTooltip="{{(currentState$ | async) ? '' : 'Brokers'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.BROKERS_LIST])">
        <mat-icon class="material-symbols-outlined">hub</mat-icon>
        <span *ngIf="(currentState$ | async)">Brokers</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/consumer-groups']"
         matTooltip="{{(currentState$ | async) ? '' : 'Consumer Groups'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CONSUMER_GROUP_LIST])">
        <mat-icon class="material-symbols-outlined">device_hub</mat-icon>
        <span *ngIf="(currentState$ | async)">Consumer Groups</span>
      </a>

      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/track']"
         matTooltip="{{(currentState$ | async) ? '' : 'Track'}}" matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.TRACK_LIST])">
        <mat-icon class="material-symbols-outlined">manage_search</mat-icon>
        <span *ngIf="(currentState$ | async)">Track</span>
      </a>
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/schemas']"
         matTooltip="{{(currentState$ | async) ? '' : 'Schema Registry'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.SCHEMA_LIST])">
        <mat-icon class="material-symbols-outlined">code</mat-icon>
        <span *ngIf="(currentState$ | async)">Schema Registry</span>
      </a>

      <a class="grouping-menu-item"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CLUSTER_LIST])">
        <span *ngIf="(currentState$ | async)">Configuration</span>
      </a>
      <a class="menu-button" mat-button [disableRipple]="true" routerLinkActive="active"
         [routerLink]="['/clusters']"
         matTooltip="{{(currentState$ | async) ? '' : 'Clusters'}}"
         matTooltipPosition="after"
         *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CLUSTER_LIST])">
        <mat-icon class="material-symbols-outlined">storage</mat-icon>
        <span *ngIf="(currentState$ | async)">Clusters</span>
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

  public backend: Backend = environment.backend;
  KouncilRole: typeof KouncilRole = KouncilRole;

  isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;
  currentState$: Observable<boolean> = this.sidebarService.isOpened$;
  @HostBinding('class') hostClass: string = 'opened';

  constructor(public authService: AuthService,
              private sidebarService: SidebarService) {
    this.sidebarService.isOpened$.subscribe(isOpened=>{
      if(isOpened){
          this.hostClass = 'opened';
      } else {
          this.hostClass = 'closed';
      }
    });
  }

  changeState(): void {
    this.sidebarService.changeState();
  }
}
