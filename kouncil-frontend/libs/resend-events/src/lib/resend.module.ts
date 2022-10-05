import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResendComponent} from '@app/resend-events';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {ConfirmModule} from '@app/feat-confirm';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    NgxMatSelectSearchModule,
    ConfirmModule
  ],
  declarations: [
    ResendComponent
  ],
  exports: [
    ResendComponent
  ]
})
export class ResendModule {
}
