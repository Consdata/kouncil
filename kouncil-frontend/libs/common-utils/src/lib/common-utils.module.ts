import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProgressBarComponent} from './util/progress-bar.component';
import {SnackBarComponent} from './util/snack-bar.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [CommonModule, MatButtonModule],
  declarations: [ProgressBarComponent, SnackBarComponent],
  exports: [ProgressBarComponent]
})
export class CommonUtilsModule {
}
