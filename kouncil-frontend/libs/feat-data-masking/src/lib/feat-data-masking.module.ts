import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonUtilsModule} from '@app/common-utils';
import {
  DataMaskingPoliciesComponent
} from "./data-masking-policies/data-masking-policies.component";
import {MatButtonModule} from "@angular/material/button";

@NgModule({
  imports: [
    CommonModule,
    FeatNoDataModule,
    RouterModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    CommonUtilsModule,
    MatButtonModule
  ],
  declarations: [
    DataMaskingPoliciesComponent
  ],
  exports: [
    DataMaskingPoliciesComponent
  ]
})
export class FeatDataMaskingModule {
}
