import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatInputModule} from '@angular/material/input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialogModule} from '@angular/material/dialog';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {SendComponent} from './send/send.component';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    NgxMatSelectSearchModule
  ],
  declarations: [
    SendComponent
  ],
  exports: [
    SendComponent
  ]
})
export class FeatSendModule {
}
