import {Component, OnInit, ViewChild} from '@angular/core';
import {SchemaRegistryService} from '../schema-registry.service';
import {Schemas} from '../schemas.model';
import {ServersService} from '@app/common-servers';
import {TableColumn, TableComponent} from '@app/common-components';
import {ProgressBarService, SnackBarComponent, SnackBarData} from '@app/common-utils';
import {MatSort} from '@angular/material/sort';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {first} from 'rxjs/operators';
import {ConfirmService} from '@app/feat-confirm';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-schemas',
  template: `
    <div class="kafka-topics" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Schemas'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns" matSort [sort]="sort"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)" [actionColumns]="actionColumns">

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of actionColumns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + columns.length"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <div class="actions-column" style="z-index: 1000">
                <button class="action-button"
                        (click)="deleteSchema(element.subjectName, element.version)">
                  Delete
                </button>
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>

      </app-common-table>
    </div>
  `,
  styleUrls: ['./schemas.component.scss']
})
export class SchemasComponent implements OnInit {

  filtered: Schemas[] = [];

  columns: TableColumn[] = [
    {
      name: 'Subject name',
      prop: 'subjectName',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300
    },
    {
      name: 'Topic name',
      prop: 'topicName',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300
    },
    {
      name: 'Message format',
      prop: 'messageFormat',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 150
    },
    {
      name: 'Version',
      prop: 'version',
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

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(TableComponent, {static: false}) table: TableComponent;

  @ViewChild(MatSort, {static: false}) set content(sort: MatSort) {
    if (this.table) {
      this.sort = sort;
    }
  }

  constructor(private progressBarService: ProgressBarService,
              private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.loadSchemas();
  }

  private loadSchemas() {
    this.schemaRegistry.loadAllSchemasForServer$(this.servers.getSelectedServerId())
    .subscribe((data: Schemas[]) => {
      this.filtered = data
      this.progressBarService.setProgress(false);
    })
  }

  drop($event: CdkDragDrop<string[]>) {
    this.table.drop($event);
  }

  deleteSchema(subject: string, version: string) {
    this.confirmService.openConfirmDialog$({
      title: 'Delete schema version',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `Schema version ${version} for subject ${subject}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.schemaRegistry.deleteSchema(this.servers.getSelectedServerId(), subject, version)
        .pipe(first())
        .subscribe(() => {
          this.loadSchemas();

          this.snackbar.openFromComponent(SnackBarComponent, {
            data: new SnackBarData(`Schema version ${version} for subject ${subject} deleted`, 'snackbar-success', ''),
            panelClass: ['snackbar'],
            duration: 3000
          });
        }, error => {
          console.error(error);
          this.snackbar.openFromComponent(SnackBarComponent, {
            data: new SnackBarData(`Schema version ${version} for subject ${subject} couldn't be deleted`, 'snackbar-error', ''),
            panelClass: ['snackbar'],
            duration: 3000
          });
          this.progressBarService.setProgress(false);
        })
      }
    });
  }
}
