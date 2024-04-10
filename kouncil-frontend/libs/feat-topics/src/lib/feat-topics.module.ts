import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopicsComponent} from './topics/list/topics.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterModule} from '@angular/router';
import {FeatNoDataModule} from '@app/feat-no-data';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from "@angular/material/table";
import {CommonComponentsModule} from "@app/common-components";
import {MatSortModule} from "@angular/material/sort";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TopicFormComponent} from "./topic/topic-form.component";
import {CommonAuthModule} from "@app/common-auth";
import {MatTableModule} from '@angular/material/table';
import {CommonComponentsModule} from '@app/common-components';
import {MatSortModule} from '@angular/material/sort';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FeatNoDataModule,
    RouterModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTableModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    CommonAuthModule
  ],
  declarations: [
    TopicsComponent,
    TopicFormComponent
  ],
  exports: [
    TopicsComponent
  ]
})
export class FeatTopicsModule {
}
