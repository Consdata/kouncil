import {ChangeDetectionStrategy, Component, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService, KouncilRole} from '@app/common-auth';
import {SidebarService} from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="sidenav" [ngClass]="(currentState$ | async) ? 'opened' : 'closed'">

      <app-sidebar-menu-item [label]="'Topics'" [icon]="'topic'" [routeLink]="'/topics'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Brokers'" [icon]="'hub'" [routeLink]="'/brokers'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Consumer Groups'" [icon]="'device_hub'"
                             [routeLink]="'/consumer-groups'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_ADMIN])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Track'" [icon]="'manage_search'" [routeLink]="'/track'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
      </app-sidebar-menu-item>

      <app-sidebar-menu-item [label]="'Schema Registry'" [icon]="'code'" [routeLink]="'/schemas'"
                             *ngIf="(isAuthenticated$ | async) && authService.canAccess([KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER])">
      </app-sidebar-menu-item>

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
