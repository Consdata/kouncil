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
  ],
  declarations: [
    ClustersComponent,
  ],
  exports: [
    ClustersComponent
  ]
})
export class FeatClustersModule {
}
