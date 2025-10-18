import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonUtilsModule} from '@app/common-utils';
import {PoliciesComponent} from './policies/policies.component';
import {MatButtonModule} from '@angular/material/button';
import {PolicyFormCreateComponent} from './policy/policy-create/policy-form-create.component';
import {PolicyFormEditComponent} from './policy/policy-edit/policy-form-edit.component';
import {PolicyFormViewComponent} from './policy/policy-view/policy-form-view.component';
import {PolicyFormComponent} from './policy/policy-form.component';
import {MatIconModule} from '@angular/material/icon';
import {FeatBreadcrumbModule} from '@app/feat-breadcrumb';
import {FormsModule} from '@angular/forms';
import {
  PolicyFormActionsComponent
} from './policy/sections/policy-form-actions/policy-form-actions.component';
import {
  PolicyFormFieldsComponent
} from './policy/sections/policy-form-fields/policy-form-fields.component';
import {
  PolicyFormResourcesComponent
} from './policy/sections/policy-form-resources/policy-form-resources.component';
import {
  PolicyFormUserGroupsComponent
} from "./policy/sections/policy-form-user-groups/policy-form-user-groups.component";

@NgModule({
  imports: [
    CommonModule,
    FeatNoDataModule,
    RouterModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    CommonUtilsModule,
    MatButtonModule,
    MatIconModule,
    FeatBreadcrumbModule,
    FormsModule
  ],
  declarations: [
    PoliciesComponent,
    PolicyFormCreateComponent,
    PolicyFormEditComponent,
    PolicyFormViewComponent,
    PolicyFormComponent,
    PolicyFormActionsComponent,
    PolicyFormFieldsComponent,
    PolicyFormResourcesComponent,
    PolicyFormUserGroupsComponent
  ],
  exports: [
    PoliciesComponent,
    PolicyFormCreateComponent,
    PolicyFormEditComponent,
    PolicyFormViewComponent
  ]
})
export class FeatDataMaskingModule {
}
