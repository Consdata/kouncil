import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LagGraphComponent} from './lag-graph/lag-graph.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  declarations: [LagGraphComponent],
  exports: [LagGraphComponent]
})
export class FeatLagGraphModule {
}
