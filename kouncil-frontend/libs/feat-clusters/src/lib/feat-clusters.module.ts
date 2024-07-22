import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {MatButtonModule} from '@angular/material/button';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ClustersComponent} from './clusters/clusters.component';
import {ClusterFormComponent} from './cluster-form/cluster-form.component';
import {CommonUtilsModule} from '@app/common-utils';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from '@angular/material/tabs';
import {
  ClusterFormBrokersComponent
} from './cluster-form/sections/cluster-form-brokers/cluster-form-brokers.component';
import {
  ClusterFormSecurityComponent
} from './cluster-form/sections/cluster-form-security/cluster-form-security.component';
import {
  ClusterFormSchemaRegistryComponent
} from './cluster-form/sections/cluster-form-schema-registry/cluster-form-schema-registry.component';
import {
  ClusterFormActionsComponent
} from './cluster-form/sections/cluster-form-actions/cluster-form-actions.component';
import {
  ClusterFormCreateComponent
} from './cluster-form/cluster-form-create/cluster-form-create.component';
import {
  ClusterFormEditComponent
} from './cluster-form/cluster-form-edit/cluster-form-edit.component';
import {
  ClusterFormViewComponent
} from './cluster-form/cluster-form-view/cluster-form-view.component';

@NgModule({
  imports: [
    CommonModule,
    FeatNoDataModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    CommonUtilsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  declarations: [
    ClustersComponent,
    ClusterFormComponent,
    ClusterFormBrokersComponent,
    ClusterFormSecurityComponent,
    ClusterFormSchemaRegistryComponent,
    ClusterFormActionsComponent,
    ClusterFormCreateComponent,
    ClusterFormEditComponent,
    ClusterFormViewComponent
  ],
  exports: [
    ClustersComponent,
    ClusterFormCreateComponent,
    ClusterFormEditComponent,
    ClusterFormViewComponent
  ]
})
export class FeatClustersModule {
}
