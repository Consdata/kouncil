import {Component} from '@angular/core';
import {ViewMode} from '@app/common-utils';

@Component({
  selector: 'app-cluster-view',
  template: `
    <app-cluster [viewMode]="ViewMode.VIEW"></app-cluster>
  `,
  styleUrls: ['./cluster-form-view.component.scss']
})
export class ClusterFormViewComponent {
  ViewMode: typeof ViewMode = ViewMode;

}
