import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopicsComponent} from './topics/topics.component';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatInputModule} from '@angular/material/input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialogModule} from '@angular/material/dialog';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [CommonModule,
    FeatNoDataModule,
    NgxDatatableModule,
    RouterModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule],
  declarations: [
    TopicsComponent
  ],
  exports: [
    TopicsComponent
  ]
})
export class FeatTopicsModule {
}
