import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ProgressBarService} from '../util/progress-bar.service';
import {ArraySortPipe} from '../util/array-sort.pipe';
import {TopicsService} from './topics.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {SendComponent} from '../send/send.component';
import {DrawerService} from '../util/drawer.service';
import {FavouritesService} from '../favourites.service';
import {ServersService} from '../servers.service';
import {SearchService} from '../search.service';
import {TopicMetadata, Topics} from './topics';

const TOPICS_FAVOURITE_KEY = 'kouncil-topics-favourites';

@Component({
  selector: 'app-topics',
  template: `
    <div class="kafka-topics" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Topic'"></app-no-data-placeholder>
      </ng-template>
      <ngx-datatable *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                     class="topics-table material"
                     [rows]="filtered"
                     [rowHeight]="48"
                     [headerHeight]="24"
                     [scrollbarH]="false"
                     [scrollbarV]="false"
                     [columnMode]="'force'"
                     [groupRowsBy]="'group'"
                     [groupExpansionDefault]="true"
                     [limit]="4"
                     (sort)="customSort($event)"
                     (activate)="navigateToTopic($event)"
                     #table>

        <ngx-datatable-group-header [rowHeight]="50" #myGroupHeader>
          <ng-template let-group="group" let-expanded="expanded" ngx-datatable-group-header-template class="datatable-group-header-wrapper">
            <div class="group-header">{{group.value[0].group === 'FAVOURITES' ? 'Favourites' : 'All topics'}}</div>
            <span class="datatable-header-divider"></span>
            <span class="datatable-header-hide" (click)="table.groupHeader.toggleExpandGroup(group)">
          <span *ngIf="expanded">HIDE</span>
          <span *ngIf="!expanded">SHOW</span>
        </span>
          </ng-template>
        </ngx-datatable-group-header>

        <ngx-datatable-column name="Name" cellClass="datatable-cell-wrapper" [width]="500">
          <ng-template let-row="row" ngx-datatable-cell-template>
            <a class="datatable-cell-anchor" [routerLink]="['/topics/messages', row.name]">
              <mat-icon class="ngx-star-favourite" [class.gray]="row.group !== 'FAVOURITES'" (click)="onFavouriteClick($event, row)">star</mat-icon>
              {{row.name}}
            </a>
          </ng-template>
        </ngx-datatable-column>

        <ngx-datatable-column name="Partitions" cellClass="datatable-cell-wrapper" [width]="150">
          <ng-template let-row="row" ngx-datatable-cell-template>
            <a class="datatable-cell-anchor" [routerLink]="['/topics/messages', row.name]">
              {{row.partitions}}
            </a>
          </ng-template>
        </ngx-datatable-column>

      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, OnDestroy {
  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortPipe: ArraySortPipe,
              private topicsService: TopicsService,
              private router: Router,
              private drawerService: DrawerService,
              private servers: ServersService,
              private favouritesService: FavouritesService) {
  }

  topics: TopicMetadata[] = [];
  filtered: TopicMetadata[] = [];
  @ViewChild('table') private table?: ElementRef;

  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadTopics();
    this.searchSubscription = this.searchService.getPhraseState('topics').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  private loadTopics(): void {
    this.topicsService.getTopics(this.servers.getSelectedServerId())
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

  navigateToTopic(event): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.router.navigate(['/topics/messages', event.row.name]);
    }
  }

  customSort(event): void {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }

}
