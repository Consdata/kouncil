import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-policy-create',
  template: `
    <app-policy [viewMode]="ViewMode.CREATE"></app-policy>
  `,
  styleUrls: ['./policy-form-create.component.scss']
})
export class PolicyFormCreateComponent {
  ViewMode: typeof ViewMode = ViewMode;

}
