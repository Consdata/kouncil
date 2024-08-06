import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-schema-details',
  template: `
    <app-schema-form [viewMode]="ViewMode.VIEW"></app-schema-form>
  `,
  styleUrls: ['./schema-details.component.scss']
})
export class SchemaDetailsComponent {

  ViewMode: typeof ViewMode = ViewMode;

  constructor() {
  }
}
