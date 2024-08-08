import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ProgressBarService, SnackBarComponent, SnackBarData} from '@app/common-utils';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {UserGroupsService} from './user-groups.service';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';
import {UserGroupService} from './user-group.service';
import {first} from 'rxjs/operators';
import {ConfirmService} from '@app/feat-confirm';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {UserGroupFormComponent} from '../form/user-group-form.component';

@Component({
  selector: 'app-user-groups',
  template: `

    <div class="main-container"
         *ngIf="authService.canAccess([SystemFunctionName.USER_GROUP_CREATE])">
      <div class="toolbar-container">
        <div class="toolbar">
          <button mat-button class="action-button-blue" (click)="addNewGroup()">
            Add new group
          </button>
        </div>
      </div>
    </div>

    <div class="user-groups" *ngIf="groups">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'User groups'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="groups && groups.length > 0; else noDataPlaceholder"
                        [tableData]="groups" [columns]="columns"
                        [actionColumns]="actionColumns"
                        matSort [sort]="sort">

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index"></app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of actionColumns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + columns.length"
                                   [template]="cellTemplate">
            <ng-template #cellTemplate let-element>
              <div class="actions-column">
                <button mat-button
                        *ngIf="authService.canAccess([SystemFunctionName.USER_GROUP_DELETE])"
                        class="action-button-red"
                        (click)="$event.stopPropagation(); removeUserGroup(element.id, element.name)">
                  Delete
                </button>
                <button mat-button
                        *ngIf="authService.canAccess([SystemFunctionName.USER_GROUP_UPDATE])"
                        class="action-button-white"
                        (click)="$event.stopPropagation(); addNewGroup(element.id)">
                  Edit
                </button>
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>
      </app-common-table>
    </div>
  `,
  styleUrls: ['./user-groups.component.scss']
})
export class UserGroupsComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;
  groups: Array<UserGroup> = [];

  columns: TableColumn[] =
    [
      {
        name: 'Group name',
        prop: 'name',
        sticky: false,
        resizeable: true,
        sortable: true,
        draggable: true,
        width: 150
      }
    ];

  actionColumns: TableColumn[] = [
    {
      name: ' ',
      prop: 'actions',
      sticky: false,
      resizeable: false,
      sortable: false,
      draggable: false,
      width: 150
    }
  ];

  private subscription: Subscription = new Subscription();

  constructor(private progressBarService: ProgressBarService,
              protected authService: AuthService,
              private userGroupsService: UserGroupsService,
              private userGroupService: UserGroupService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadGroups(): void {
    this.subscription.add(this.userGroupsService.getUserGroups$().subscribe((data: Array<UserGroup>) => {
      this.groups = data;
      this.progressBarService.setProgress(false);
    }));
  }

  addNewGroup(id?: number): void {
    const config: MatDialogConfig = {
      data: id,
      width: '500px',
      autoFocus: 'dialog',
      panelClass: ['app-drawer']
    };

    const matDialogRef = this.dialog.open(UserGroupFormComponent, config);

    this.subscription.add(matDialogRef.afterClosed().subscribe(() => {
      if (!id) {
        this.loadGroups();
      }
    }));
  }

  removeUserGroup(id: number, userGroupName: string): void {
    this.subscription.add(this.confirmService.openConfirmDialog$({
      title: 'Delete user group ',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `User group  ${userGroupName}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.deleteUserGroup(id, userGroupName);
      }
    }));
  }

  private deleteUserGroup(id: number, userGroupName: string): void {
    this.subscription.add(this.userGroupService.deleteUserGroup$(id)
    .pipe(first())
    .subscribe({
      next: () => {
        this.loadGroups();

        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`User group ${userGroupName} deleted`, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`User group ${userGroupName} couldn't be deleted`, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
        this.progressBarService.setProgress(false);
      }
    }));
  }
}
