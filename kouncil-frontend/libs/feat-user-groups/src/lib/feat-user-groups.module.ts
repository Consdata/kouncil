import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonComponentsModule} from '@app/common-components';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSortModule} from '@angular/material/sort';
import {MatExpansionModule} from '@angular/material/expansion';
import {UserGroupsComponent} from './user-groups/list/user-groups.component';
import {FeatNoDataModule} from '@app/feat-no-data';
import {UserGroupFormComponent} from './user-groups/form/user-group-form.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    CommonComponentsModule,
    DragDropModule,
    MatSortModule,
    MatExpansionModule,
    FeatNoDataModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  declarations: [
    UserGroupsComponent,
    UserGroupFormComponent
  ],
  exports: [
    UserGroupsComponent,
    UserGroupFormComponent
  ]
})
export class FeatUserGroupsModule {
}
