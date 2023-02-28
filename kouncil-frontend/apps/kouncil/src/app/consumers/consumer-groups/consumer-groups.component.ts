import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ConsumerGroupsService} from './consumer-groups.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmService} from '@app/feat-confirm';
import {FavouritesService} from '@app/feat-favourites';
import {ConsumerGroup, ConsumerGroupsResponse} from '@app/common-model';
import {ArraySortService, ProgressBarService, SearchService} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {TableColumn} from '@app/common-components';

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
                        [additionalColumns]="additionalColumns" matSort
                        [actionColumns]="actionColumns"
                        (rowClickedAction)="navigateToConsumerGroup($event)"
                        [groupHeaderName]="groupHeaderName"
                        [groupedTable]="true"
                        [groupByColumns]="['group']">

        <ng-container *ngFor="let column of additionalColumns; let index = index">
          <app-common-table-column [column]="column" [index]="index"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
              <div class="datatable-cell-anchor">
                <mat-icon class="star-favourite" [class.gray]="element.group !== 'FAVOURITES'"
                          (click)="onFavouriteClick($event, element)">star
                </mat-icon>
                {{element.groupId}}
              </div>
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
              <div class="actions-column" style="z-index: 1000">
                <button class="action-button" (click)="deleteConsumerGroup(element.groupId)">
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
export class ConsumerGroupsComponent implements OnInit, OnDestroy {

  consumerGroups: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];

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
        width: 190
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
              private favouritesService: FavouritesService) {
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
          this.snackbar.open(`Consumer group ${value} deleted`, '', {
            duration: 3000,
            panelClass: ['snackbar-success', 'snackbar']
          });
        }, error => {
          console.error(error);
          this.snackbar.open(`Consumer group ${value} couldn't be deleted`, '', {
            duration: 3000,
            panelClass: ['snackbar-error', 'snackbar']
          });
          this.progressBarService.setProgress(false);
        });
      }
    });
  }

  navigateToConsumerGroup(event: ConsumerGroup): void {
    this.router.navigate(['/consumer-groups/', event.groupId]);
  }

  customSort(event: { column: { prop: string }, newValue: string }): void {
    this.filtered = this.arraySortService.transform(this.filtered, event.column.prop, event.newValue);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
