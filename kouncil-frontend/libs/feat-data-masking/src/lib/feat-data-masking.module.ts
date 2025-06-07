import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonUtilsModule} from '@app/common-utils';
import {PoliciesComponent} from "./policies/policies.component";
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
    PoliciesComponent
  ],
  exports: [
    PoliciesComponent
  ]
})
export class FeatDataMaskingModule {
}
