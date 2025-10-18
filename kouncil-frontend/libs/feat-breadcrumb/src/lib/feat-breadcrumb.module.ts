import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonUtilsModule} from '@app/common-utils';
import {MatButtonModule} from "@angular/material/button";
import {BreadcrumbComponent} from "./breadcrumb/breadcrumb.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";

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
    MatTooltipModule,
    MatIconModule
  ],
  declarations: [
    BreadcrumbComponent
  ],
  exports: [
    BreadcrumbComponent
  ]
})
export class FeatBreadcrumbModule {
}
