import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-policy-edit',
  template: `
    <app-policy [viewMode]="ViewMode.EDIT"></app-policy>
  `,
  styleUrls: ['./policy-form-edit.component.scss']
})
export class PolicyFormEditComponent {
  ViewMode: typeof ViewMode = ViewMode;
}
