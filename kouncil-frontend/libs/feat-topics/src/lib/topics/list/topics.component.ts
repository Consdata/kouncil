import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {TopicsService} from '../topics.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {FavouritesService} from '@app/feat-favourites';
import {
  ArraySortService,
  DrawerService,
  ProgressBarService,
  SearchService,
  SnackBarComponent,
  SnackBarData
} from '@app/common-utils';
import {TopicMetadata, Topics} from '@app/common-model';
import {ServersService} from '@app/common-servers';
import {AbstractTableComponent, TableColumn, TableGroup} from '@app/common-components';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmService} from '@app/feat-confirm';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {TopicFormComponent, TopicService} from '@app/feat-topic-form';

const TOPICS_FAVOURITE_KEY = 'kouncil-topics-favourites';

@Component({
  selector: 'app-topics',
  template: `

    <div class="main-container" *ngIf="authService.canAccess([SystemFunctionName.TOPIC_CREATE])">
      <div class="toolbar-container">
        <div class="toolbar">
          <button mat-button class="action-button-black" (click)="createTopic()">
            Create topic
          </button>
        </div>
      </div>
    </div>

    <div class="kafka-topics" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Topic'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns"
                        [additionalColumns]="additionalColumns"
                        [actionColumns]="actionColumns"
                        matSort [sort]="sort" (sortEvent)="customSort($event)"
                        (rowClickedAction)="navigateToTopic($event)"
                        [groupHeaderName]="groupHeaderName"
                        [groupedTable]="true" [rowClass]="getRowClass"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)"
                        [groupByColumns]="['group']">

        <ng-container *ngFor="let column of additionalColumns; let index = index">

          <app-common-table-column [column]="column" [index]="index"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <a class="datatable-cell-anchor" [routerLink]="['/topics/messages', element.name]">
                <mat-icon class="material-symbols-outlined star-favourite"
                          [class.gray]="element.group !== 'FAVOURITES'"
                          (click)="onFavouriteClick($event, element)">star
                </mat-icon>
                {{ element.name }}
              </a>
            </ng-template>
          </app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + additionalColumns.length"></app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of actionColumns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + columns.length"
                                   [template]="cellTemplate">
            <ng-template #cellTemplate let-element>
              <div class="actions-column">
                <button *ngIf="authService.canAccess([SystemFunctionName.TOPIC_UPDATE])"
                        class="action-button" (click)="createTopic(element.name)">
                  Update
                </button>
                <button *ngIf="authService.canAccess([SystemFunctionName.TOPIC_DELETE])"
                        class="action-button" (click)="removeTopic(element.name)">
                  Delete
                </button>
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>
      </app-common-table>
    </div>
  `,
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;
  topics: TopicMetadata[] = [];
  filtered: TopicMetadata[] = [];

  additionalColumns: TableColumn[] = [
    {
      name: 'Name',
      prop: 'name',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 500
    }
  ];

  columns: TableColumn[] =
    [
      {
        name: 'Partitions',
        prop: 'partitions',
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

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortService: ArraySortService,
              private topicsService: TopicsService,
              private router: Router,
              private drawerService: DrawerService,
              private servers: ServersService,
              private favouritesService: FavouritesService,
              private dialog: MatDialog,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              private topicService: TopicService,
              protected authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadTopics();
    this.subscription.add(this.searchService.getPhraseState$('topics')
    .subscribe(phrase => {
      this.filter(phrase);
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  groupHeaderName: (group: TableGroup) => string = (group: TableGroup): string => {
    return group.group === 'FAVOURITES' ? 'Favourites' : 'All topics';
  };

  private loadTopics(): void {
    this.subscription.add(this.topicsService.getTopics$(this.servers.getSelectedServerId())
    .pipe(first())
    .subscribe((data: Topics) => {
      this.topics = data.topics.map(t => new TopicMetadata(t.partitions, null, t.name));
      this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    }));
  }


  private filter(phrase?: string): void {
    this.filtered = this.topics.filter((topicsMetadata) => {
      return !phrase || topicsMetadata.name.indexOf(phrase) > -1;
    });
  }

  onFavouriteClick(event: MouseEvent, row: TopicMetadata): void {
    event.preventDefault();
    this.progressBarService.setProgress(true);
    this.filtered = [];
    setTimeout(() => {
      this.favouritesService.updateFavourites(row, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    });
  }

  navigateToTopic(event: TopicMetadata): void {
    this.router.navigate(['/topics/messages', event.name]);
  }

  customSort(sort: MatSort): void {
    this.filtered = this.arraySortService.transform(this.filtered, sort.active, sort.direction);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
  getRowClass: (row) => { 'row-retry': any, 'row-dlq': any } = (row) => {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'row-retry': (() => {
        return row.name.includes('retry');
      })(),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'row-dlq': (() => {
        return row.name.includes('dlq');
      })()
    };
  };

  createTopic(topicName?: string): void {
    const config: MatDialogConfig = {
      data: topicName,
      width: '500px',
      autoFocus: 'dialog',
      panelClass: ['app-drawer']
    };

    const matDialogRef = this.dialog.open(TopicFormComponent, config);

    this.subscription.add(matDialogRef.afterClosed().subscribe(() => {
      this.loadTopics();
    }));
  }

  removeTopic(topicName: string): void {
    this.subscription.add(this.confirmService.openConfirmDialog$({
      title: 'Delete topic',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `Topic ${topicName}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.deleteTopic(topicName);
      }
    }));
  }

  private deleteTopic(topicName: string) {
    this.subscription.add(this.topicService.deleteSchema$(topicName, this.servers.getSelectedServerId())
    .pipe(first())
    .subscribe({
      next: () => {
        this.loadTopics();

        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Topic ${topicName} deleted`, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Topic ${topicName} couldn't be deleted`, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
        this.progressBarService.setProgress(false);
      }
    }));
  }
}
