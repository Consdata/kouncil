import {Component, OnInit} from '@angular/core';
import {Schema, SchemaRegistryService} from '@app/schema-registry';
import {ServersService} from '@app/common-servers';
import {AbstractTableComponent, SelectableItem, TableColumn} from '@app/common-components';
import {ProgressBarService, SnackBarComponent, SnackBarData} from '@app/common-utils';
import {first} from 'rxjs/operators';
import {ConfirmService} from '@app/feat-confirm';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormControl} from '@angular/forms';
import {TopicsService} from '@app/feat-topics';
import {Topics} from '@app/common-model';
import {Router} from '@angular/router';
import {AuthService, KouncilRole} from '@app/common-auth';

@Component({
  selector: 'app-schemas',
  template: `
    <div class="main-container">
      <div class="toolbar-container">
        <div class="toolbar">
          <app-common-autocomplete [control]="topicFilterControl"
                                   [data]="topicList"
                                   [placeholder]="'Topics'"
                                   [emptyFilteredMsg]="'No topics found'"
                                   [panelWidth]="'auto'"
                                   (selectedValueEvent)="updateTopics($event)"></app-common-autocomplete>

          <button mat-button class="action-button-black" (click)="search()">
            Search
            <mat-icon class="search-icon">search</mat-icon>
          </button>

          <button mat-button class="action-button-white" (click)="clearFilters()">
            Clear filters
          </button>

          <button mat-button *ngIf="authService.canAccess([KouncilRole.KOUNCIL_EDITOR])"
                  class="action-button-black" [routerLink]="['/schemas/create']">
            Add new schema
          </button>
        </div>
      </div>
    </div>

    <div *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Schemas'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns" matSort [sort]="sort"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)" [actionColumns]="actionColumns"
                        (rowClickedAction)="navigateToDetails($event)">

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of actionColumns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + columns.length"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <div class="actions-column">
                <button class="action-button"
                        *ngIf="authService.canAccess([KouncilRole.KOUNCIL_EDITOR])"
                        [routerLink]="['/schemas/edit/' + element.subjectName + '/' + element.version]">
                  Edit
                </button>
                <button class="action-button"
                        *ngIf="authService.canAccess([KouncilRole.KOUNCIL_EDITOR])"
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
export class SchemasComponent extends AbstractTableComponent implements OnInit {

  KouncilRole: typeof KouncilRole = KouncilRole;
  filtered: Schema[] = [];

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

  topicList: SelectableItem[] = [];
  selectedTopics: string[] = [];
  topicFilterControl: FormControl = new FormControl();

  constructor(private progressBarService: ProgressBarService,
              private schemaRegistry: SchemaRegistryService,
              private servers: ServersService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              protected authService: AuthService,
              private topicsService: TopicsService,
              private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadSchemas();
    this.topicsService
    .getTopics$(this.servers.getSelectedServerId())
    .subscribe((topics: Topics) => {
      this.topicList = topics.topics.map((tm) => new SelectableItem(tm.name, tm.name, false));
    });
  }

  private loadSchemas(): void {
    this.schemaRegistry.loadAllSchemasForServer$(this.servers.getSelectedServerId(), this.selectedTopics)
    .subscribe((data: Schema[]) => {
      this.filtered = data;
      this.progressBarService.setProgress(false);
    });
  }

  deleteSchema(subject: string, version: string): void {
    this.confirmService.openConfirmDialog$({
      title: 'Delete schema version',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `Schema version ${version} for subject ${subject}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.removeSchema(subject, version);
      }
    });
  }

  clearFilters(): void {
    this.selectedTopics = [];
    this.topicFilterControl.setValue([]);
    this.topicList.forEach(topic => topic.selected = false);
  }

  search(): void {
    this.loadSchemas();
  }

  updateTopics($event: Array<string>): void {
    this.selectedTopics = $event;
  }

  private removeSchema(subject: string, version: string) {
    this.schemaRegistry.deleteSchema$(this.servers.getSelectedServerId(), subject, version)
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
    });
  }

  navigateToDetails(schema: Schema): void {
    this.router.navigate([`/schemas/${schema.subjectName}/${schema.version}`]);
  }
}
