import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {TopicsService} from './topics.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {FavouritesService} from '@app/feat-favourites';
import {
  ArraySortService,
  DrawerService,
  ProgressBarService,
  SearchService
} from '@app/common-utils';
import {TopicMetadata, Topics} from '@app/common-model';
import {ServersService} from '@app/common-servers';
import {TableColumn} from "@app/common-components";

const TOPICS_FAVOURITE_KEY = 'kouncil-topics-favourites';

@Component({
  selector: 'app-topics',
  template: `
    <div class="kafka-topics" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Topic'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns"
                        [additionalColumns]="additionalColumns" matSort
                        (rowClickedAction)="navigateToTopic($event)"
                        [groupHeaderName]="groupHeaderName"
                        [groupedTable]="true" [rowClass]="getRowClass"
                        [groupByColumns]="['group']">

        <ng-container *ngFor="let column of additionalColumns; let index = index">

          <app-common-table-column [column]="column" [index]="index"
                                   [template]="cellTemplate">

            <ng-template #cellTemplate let-element>
                <a class="datatable-cell-anchor" [routerLink]="['/topics/messages', element.name]">
                  <mat-icon class="star-favourite" [class.gray]="element.group !== 'FAVOURITES'"
                            (click)="onFavouriteClick($event, element)">star
                  </mat-icon>
                  {{element.name}}
                </a>
            </ng-template>
          </app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + additionalColumns.length"></app-common-table-column>
        </ng-container>

      </app-common-table>
    </div>
  `,
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, OnDestroy {

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

  groupHeaderName = (group) => {
    return group.group === 'FAVOURITES' ? 'Favourites' : 'All topics'
  }

  private searchSubscription?: Subscription;

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortService: ArraySortService,
              private topicsService: TopicsService,
              private router: Router,
              private drawerService: DrawerService,
              private servers: ServersService,
              private favouritesService: FavouritesService) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadTopics();
    this.searchSubscription = this.searchService.getPhraseState$('topics').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  private loadTopics(): void {
    this.topicsService.getTopics$(this.servers.getSelectedServerId())
    .pipe(first())
    .subscribe((data: Topics) => {
      this.topics = data.topics.map(t => new TopicMetadata(t.partitions, null, t.name));
      this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
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

  customSort(event: { column: { prop: string }, newValue: string }): void {
    this.filtered = this.arraySortService.transform(this.filtered, event.column.prop, event.newValue);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowClass: (row) => { 'row-retry': any, 'row-dlq': any } = (row) => {
    return {
      'row-retry': (() => {
        return row.name.includes('retry');
      })(),
      'row-dlq': (() => {
        return row.name.includes('dlq');
      })()
    };
  };
}
