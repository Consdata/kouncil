import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-cluster-edit',
  template: `
    <app-cluster [viewMode]="ViewMode.EDIT"></app-cluster>
  `,
  styleUrls: ['./cluster-form-edit.component.scss']
})
export class ClusterFormEditComponent {
  ViewMode: typeof ViewMode = ViewMode;
}
