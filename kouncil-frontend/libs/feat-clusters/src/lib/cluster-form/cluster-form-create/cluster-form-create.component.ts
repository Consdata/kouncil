import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-cluster-create',
  template: `
    <app-cluster [viewMode]="ViewMode.CREATE"></app-cluster>
  `,
  styleUrls: ['./cluster-form-create.component.scss']
})
export class ClusterFormCreateComponent {
  ViewMode: typeof ViewMode = ViewMode;

}
