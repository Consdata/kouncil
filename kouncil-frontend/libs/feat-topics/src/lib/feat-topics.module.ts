import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopicsComponent} from './topics/list/topics.component';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {MatButtonModule} from '@angular/material/button';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';

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
    TopicsComponent,
  ],
  exports: [
    TopicsComponent
  ]
})
export class FeatTopicsModule {
}
