import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {SidebarService} from './sidebar.service';
import {environment} from '../../environments/environment';
import {Backend} from '@app/common-model';
import {SidebarState} from './sidebar-state';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidenav"
         [ngClass]="{'opened': (currentState$ | async), 'closed': (currentState$| async) === false, 'sidenav-demo': backend === 'DEMO'}">

      <app-sidebar-menu-item [label]="'Topics'" [icon]="'topic'" [routeLink]="'/topics'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.TOPIC_LIST])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Brokers'" [icon]="'hub'" [routeLink]="'/brokers'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.BROKERS_LIST])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Consumer Groups'" [icon]="'device_hub'"
                             [routeLink]="'/consumer-groups'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CONSUMER_GROUP_LIST])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Track'" [icon]="'manage_search'" [routeLink]="'/track'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.TRACK_LIST])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Schema Registry'" [icon]="'code'" [routeLink]="'/schemas'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.SCHEMA_LIST])">
      </app-sidebar-menu-item>

      <div *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CLUSTER_LIST])"
           class="menu-grouping-separator"></div>

      <app-sidebar-menu-item [label]="'Clusters'" [icon]="'storage'" [routeLink]="'/clusters'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.CLUSTER_LIST])">
      </app-sidebar-menu-item>

      <div class="toggle-sidebar-container">
        <button mat-icon-button class="toggle-sidebar-btn" (click)="changeState()">
          <mat-icon class="material-symbols-outlined toggle-sidebar-btn-icon">
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
  KouncilRole: typeof SystemFunctionName = SystemFunctionName;

  isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;
  currentState$: Observable<boolean> = this.sidebarService.isOpened$;
  @HostBinding('class') hostClass: SidebarState = SidebarState.OPENED;

  constructor(public authService: AuthService,
              private sidebarService: SidebarService) {
    this.sidebarService.isOpened$.subscribe(isOpened=>{
      if(isOpened){
          this.hostClass = SidebarState.OPENED;
      } else {
          this.hostClass = SidebarState.CLOSED;
      }
    });
  }

  changeState(): void {
    this.sidebarService.changeState();
  }
}
