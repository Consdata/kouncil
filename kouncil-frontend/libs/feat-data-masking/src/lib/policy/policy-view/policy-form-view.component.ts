import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-policy-view',
  template: `
    <app-policy [viewMode]="ViewMode.VIEW"></app-policy>
  `,
  styleUrls: ['./policy-form-view.component.scss']
})
export class PolicyFormViewComponent {
  ViewMode: typeof ViewMode = ViewMode;

}
