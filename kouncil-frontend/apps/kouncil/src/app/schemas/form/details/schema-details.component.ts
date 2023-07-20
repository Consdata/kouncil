import {Component} from '@angular/core';
import {ViewMode} from '../view-mode';

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
