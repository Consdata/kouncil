import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResendComponent} from '@app/resend-events';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {ConfirmModule} from '@app/feat-confirm';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from "@angular/material/checkbox";

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
        ConfirmModule,
        MatCheckboxModule
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
