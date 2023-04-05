import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutocompleteComponent} from "./autocomplete/autocomplete.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {TableComponent} from "./table/table.component";
import {MatTableModule} from "@angular/material/table";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatSortModule} from "@angular/material/sort";
import {TableColumnComponent} from "./table-column/table-column.component";
import {ResizeColumnDirective} from "./table-column/resize-column.directive";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    DragDropModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [
    AutocompleteComponent,
    TableComponent,
    ResizeColumnDirective,
    TableColumnComponent
  ],
  exports: [
    AutocompleteComponent,
    TableComponent,
    TableColumnComponent,
  ]
})
export class CommonComponentsModule {
}
