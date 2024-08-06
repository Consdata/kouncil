import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {SidebarService} from '../sidebar.service';

@Component({
  selector: 'app-sidebar-menu-item',
  template: `
    <a class="menu-button" mat-button [disableRipple]="true"
       routerLinkActive="active" [routerLink]="[routeLink]"
       matTooltip="{{(currentState$ | async) ? '' : label}}" matTooltipPosition="after">

      <mat-icon class="material-symbols-outlined">{{ icon }}</mat-icon>
      <span *ngIf="(currentState$ | async)">{{ label }}</span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sidebar-menu-item.component.scss']
})
export class SidebarMenuItemComponent {

  @Input() routeLink: string;
  @Input() icon: string;
  @Input() label: string;

  currentState$: Observable<boolean> = this.sidebarService.isOpened$;

  constructor(private sidebarService: SidebarService) {
  }
}
