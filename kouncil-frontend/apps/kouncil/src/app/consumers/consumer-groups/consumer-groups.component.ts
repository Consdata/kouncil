import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ConsumerGroupsService} from './consumer-groups.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from '../../servers.service';
import {SearchService} from '../../search.service';
import {ProgressBarService} from '../../util/progress-bar.service';
import {ConsumerGroup, ConsumerGroupsResponse} from './consumer-groups';
import {ArraySortService} from '../../util/array-sort.service';
import {Model} from '@swimlane/ngx-datatable';
import {ConfirmService} from '@app/feat-confirm';
import {FavouritesService} from '@app/feat-favourites';

const CONSUMER_GROUP_FAVOURITE_KEY = 'kouncil-consumer-groups-favourites';

@Component({
  selector: 'app-kafka-consumer-groups',
  template: `
    <div class="kafka-consumer-groups" *ngIf="filtered">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Consumer group'"></app-no-data-placeholder>
      </ng-template>
      <ngx-datatable *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                     class="consumer-groups-table material"
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
                     (activate)="navigateToConsumerGroup($event)"
                     #table>

        <ngx-datatable-group-header [rowHeight]="50" #myGroupHeader>
          <ng-template let-group="group" let-expanded="expanded" ngx-datatable-group-header-template>
            <div
              class="group-header">{{group.value[0].group === 'FAVOURITES' ? 'Favourites' : 'All consumer groups'}}</div>
            <span class="datatable-header-divider"></span>
            <span class="datatable-header-hide" (click)="table.groupHeader.toggleExpandGroup(group)">
          <span *ngIf="expanded">HIDE</span>
          <span *ngIf="!expanded">SHOW</span>
        </span>
          </ng-template>
        </ngx-datatable-group-header>

        <ngx-datatable-column prop="groupId" name="Group id" cellClass="datatable-cell-wrapper" [width]="500">
          <ng-template let-value="value" let-row="row" ngx-datatable-cell-template>
            <a class="datatable-cell-anchor" [routerLink]="['/consumer-groups/', value]">
              <mat-icon class="ngx-star-favourite" [class.gray]="row.group !== 'FAVOURITES'"
                        (click)="onFavouriteClick($event, row)">star
              </mat-icon>
              {{value}}
            </a>
          </ng-template>
        </ngx-datatable-column>

        <ngx-datatable-column prop="status" name="Status" cellClass="datatable-cell-wrapper" [width]="190">
          <ng-template let-value="value" let-row="row" ngx-datatable-cell-template>
            <a class="datatable-cell-anchor" [routerLink]="['/consumer-groups/', row.groupId]"
               [ngClass]="getStatusClass(value)">
              {{value}}
            </a>
          </ng-template>
        </ngx-datatable-column>

        <ngx-datatable-column prop="groupId" name="" cellClass="ngx-actions-column" [width]="240"
                              [sortable]="false" [resizeable]="false" [canAutoResize]="false">
          <ng-template let-value="value" let-row="row" ngx-datatable-cell-template>
            <button class="ngx-action-button" (click)="deleteConsumerGroup(value)">Delete</button>
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./consumer-groups.component.scss']
})
export class ConsumerGroupsComponent implements OnInit, OnDestroy {

  consumerGroups: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];
  @ViewChild('table') private table?: ElementRef;

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
    this.confirmService.openConfirmDialog$('consumer group', value)
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
              console.warn(error);
              this.snackbar.open(`Consumer group ${value} couldn't be deleted`, '', {
                duration: 3000,
                panelClass: ['snackbar-error', 'snackbar']
              });
              this.progressBarService.setProgress(false);
            });
        }
      });
  }

  navigateToConsumerGroup(event: Model): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.router.navigate(['/consumer-groups/', event.row.groupId]);
    }
  }

  customSort(event: { column: { prop: string }, newValue: string }): void {
    this.filtered = this.arraySortService.transform(this.filtered, event.column.prop, event.newValue);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}
