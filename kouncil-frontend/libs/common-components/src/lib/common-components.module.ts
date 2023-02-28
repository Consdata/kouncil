import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutocompleteComponent} from "./autocomplete/autocomplete.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
    AutocompleteComponent
  ],
  exports: [
    AutocompleteComponent
  ]
})
export class CommonComponentsModule {
}
