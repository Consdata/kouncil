import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <div class="wrapper">
      <div *ngIf="parentLink" routerLink="{{parentLink}}" class="parent">{{parentName}}</div>
      <div *ngIf="parentLink" class="divider">
        <mat-icon class="material-symbols-outlined arrow">arrow_forward_ios</mat-icon>
      </div>
      <div class="name"><span [matTooltip]="name">{{name}}</span></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

  @Input() parentLink?: string;
  @Input() parentName?: string;
  @Input() name?: string;

}
