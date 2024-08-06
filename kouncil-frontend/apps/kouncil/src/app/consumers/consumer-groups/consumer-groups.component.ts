import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ConsumerGroupsService} from './consumer-groups.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmService} from '@app/feat-confirm';
import {FavouritesService} from '@app/feat-favourites';
import {ConsumerGroup, ConsumerGroupsResponse} from '@app/common-model';
import {
  ArraySortService,
  ProgressBarService,
  SearchService,
  SnackBarComponent,
  SnackBarData
} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {MatSort} from '@angular/material/sort';
import {AuthService, SystemFunctionName} from '@app/common-auth';

const CONSUMER_GROUP_FAVOURITE_KEY = 'kouncil-consumer-groups-favourites';

@Component({
  selector: 'app-kafka-consumer-groups',
  template: `
    <div class="kafka-consumer-groups" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Consumer group'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns"
                        [additionalColumns]="additionalColumns"
                        matSort [sort]="sort" (sortEvent)="customSort($event)"
                        [actionColumns]="actionColumns"
                        (rowClickedAction)="navigateToConsumerGroup($event)"
                        [groupHeaderName]="groupHeaderName"
                        [groupedTable]="true"
                        [groupByColumns]="['group']"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)">

        <ng-container *ngFor="let column of additionalColumns; let index = index">
          <app-common-table-column [column]="column" [index]="index"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <a class="datatable-cell-anchor"
                 [routerLink]="['/consumer-groups/', element.groupId]">
                <mat-icon class="material-symbols-outlined star-favourite"
                          [class.gray]="element.group !== 'FAVOURITES'"
                          (click)="onFavouriteClick($event, element)">star
                </mat-icon>
                {{ element.groupId }}
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
                                   [index]="index + additionalColumns.length + columns.length"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <div class="actions-column">
                <button *ngIf="authService.canAccess([SystemFunctionName.CONSUMER_GROUP_DELETE])"
                        class="action-button" (click)="deleteConsumerGroup(element.groupId)">
                  Delete
                </button>
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>
      </app-common-table>
    </div>
  `,
  styleUrls: ['./consumer-groups.component.scss']
})
export class ConsumerGroupsComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  consumerGroups: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];
  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;

  additionalColumns: TableColumn[] = [
    {
      name: 'Group id',
      prop: 'groupId',
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
        name: 'Status',
        prop: 'status',
        sticky: false,
        resizeable: true,
        sortable: true,
        draggable: true,
        width: 190,
        columnClass: this.getStatusClass
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
      width: 240
    }
  ];

  private searchSubscription?: Subscription;

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortService: ArraySortService,
              private consumerGroupsService: ConsumerGroupsService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              private router: Router,
              private servers: ServersService,
              private favouritesService: FavouritesService,
              protected authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadConsumerGroups();
    this.searchSubscription = this.searchService.getPhraseState$('consumer-groups').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  groupHeaderName: (group) => string = (group) => {
    return group.group === 'FAVOURITES' ? 'Favourites' : 'All consumer groups';
  };

  private loadConsumerGroups(): void {
    this.consumerGroupsService.getConsumerGroups$(this.servers.getSelectedServerId())
    .pipe(first())
    .subscribe((data: ConsumerGroupsResponse) => {
      this.consumerGroups = data.consumerGroups.map(t => new ConsumerGroup(t.groupId, t.status, null));
      this.favouritesService.applyFavourites(this.consumerGroups, CONSUMER_GROUP_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private filter(phrase?: string): void {
    this.filtered = this.consumerGroups.filter((consumerGroup) => {
      return !phrase || consumerGroup.groupId.indexOf(phrase) > -1;
    });
  }

  onFavouriteClick(event: MouseEvent, row: ConsumerGroup): void {
    event.preventDefault();
    this.progressBarService.setProgress(true);
    this.filtered = [];
    setTimeout(() => {
      this.favouritesService.updateFavourites(row, CONSUMER_GROUP_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.favouritesService.applyFavourites(this.consumerGroups, CONSUMER_GROUP_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    });
  }

  deleteConsumerGroup(value: string): void {
    this.confirmService.openConfirmDialog$({
      title: 'Delete consumer group',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: value
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.consumerGroupsService.deleteConsumerGroup$(this.servers.getSelectedServerId(), value)
        .pipe(first())
        // eslint-disable-next-line rxjs/no-nested-subscribe
        .subscribe(() => {
          this.loadConsumerGroups();

          this.snackbar.openFromComponent(SnackBarComponent, {
            data: new SnackBarData(`Consumer group ${value} deleted`, 'snackbar-success', ''),
            panelClass: ['snackbar'],
            duration: 3000
          });
        }, error => {
          console.error(error);
          this.snackbar.openFromComponent(SnackBarComponent, {
            data: new SnackBarData(`Consumer group ${value} couldn't be deleted`, 'snackbar-error', ''),
            panelClass: ['snackbar'],
            duration: 3000
          });
          this.progressBarService.setProgress(false);
        });
      }
    });
  }

  navigateToConsumerGroup(event: ConsumerGroup): void {
    this.router.navigate(['/consumer-groups/', event.groupId]);
  }

  customSort(sort: MatSort): void {
    this.filtered = this.arraySortService.transform(this.filtered, sort.active, sort.direction);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
