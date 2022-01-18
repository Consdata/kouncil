import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  template: `
    <div class="wrapper">
      <div routerLink="{{parentLink}}" class="parent">{{parentName}}</div>
      <div class="divider">
        <mat-icon class="arrow">arrow_forward_ios</mat-icon>
      </div>
      <div class="name">{{name}}</div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

  @Input() parentLink: string;
  @Input() parentName: string;
  @Input() name: string;

}
