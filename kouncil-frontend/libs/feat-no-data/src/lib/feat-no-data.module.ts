import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoDataPlaceholderComponent} from './no-data-placeholder/no-data-placeholder.component';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  imports: [CommonModule,
  MatIconModule],
  declarations: [
    NoDataPlaceholderComponent
  ],
  exports: [
    NoDataPlaceholderComponent
  ]
})
export class FeatNoDataModule {
}
