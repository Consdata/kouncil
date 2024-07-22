import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutocompleteComponent} from './autocomplete/autocomplete.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {TableComponent} from './table/table.component';
import {MatTableModule} from '@angular/material/table';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSortModule} from '@angular/material/sort';
import {TableColumnComponent} from './table-column/table-column.component';
import {ResizeColumnDirective} from './table-column/resize-column.directive';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {EditorComponent} from './editor/editor.component';
import {TextFieldComponent} from './text-field/text-field.component';
import {PasswordFieldComponent} from './password-field/password-field.component';
import {SelectFieldComponent} from './select-field/select-field.component';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {RadioFieldComponent} from './radio-field/radio-field.component';

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
    MatTooltipModule,
    MatSelectModule,
    MatRadioModule,
  ],
  declarations: [
    AutocompleteComponent,
    TableComponent,
    ResizeColumnDirective,
    TableColumnComponent,
    EditorComponent,
    TextFieldComponent,
    PasswordFieldComponent,
    SelectFieldComponent,
    RadioFieldComponent,
  ],
  exports: [
    AutocompleteComponent,
    TableComponent,
    TableColumnComponent,
    EditorComponent,
    TextFieldComponent,
    PasswordFieldComponent,
    SelectFieldComponent,
    RadioFieldComponent,
  ]
})
export class CommonComponentsModule {
}
