import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {SearchService} from 'app/search.service';
import {ConsumerGroup, ConsumerGroupsResponse} from 'app/consumers/consumer-groups/consumer-groups';
import {ProgressBarService} from 'app/util/progress-bar.service';
import {ArraySortPipe} from '../../util/array-sort.pipe';
import {ConsumerGroupsService} from './consumer-groups.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {ConfirmService} from '../../confirm/confirm.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FavouritesService} from '../../favourites.service';
import {ServersService} from '../../servers.service';

const CONSUMER_GROUP_FAVOURITE_KEY = 'kouncil-consumer-groups-favourites';

@Component({
  selector: 'app-kafka-consumer-groups',
  templateUrl: './consumer-groups.component.html',
  styleUrls: ['./consumer-groups.component.scss']
})
export class ConsumerGroupsComponent implements OnInit, OnDestroy {

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortPipe: ArraySortPipe,
              private consumerGroupsService: ConsumerGroupsService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              private router: Router,
              private servers: ServersService,
              private favouritesService: FavouritesService) {
  }

  consumerGroups: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];
  @ViewChild('table') private table: ElementRef;

  private searchSubscription?: Subscription;

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadConsumerGroups();
    this.searchSubscription = this.searchService.getPhraseState('consumer-groups').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  private loadConsumerGroups(): void {
    this.consumerGroupsService.getConsumerGroups(this.servers.getSelectedServerId())
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

  private filter(phrase: string): void {
    this.filtered = this.consumerGroups.filter((consumerGroup) => {
      return !phrase || consumerGroup.groupId.indexOf(phrase) > -1;
    });
  }

  onFavouriteClick(event: MouseEvent, row): void {
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
    this.confirmService.openConfirmDialog('consumer group', value)
      .pipe(first())
      .subscribe((confirmed) => {
        if (confirmed) {
          this.progressBarService.setProgress(true);
          this.consumerGroupsService.deleteConsumerGroup(this.servers.getSelectedServerId(), value)
            .pipe(first())
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

  navigateToConsumerGroup(event): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.router.navigate(['/consumer-groups/', event.row.groupId]);
    }
  }

  customSort(event): void {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }

  getStatusClass(status: string): string {
    return `status-${ status.toLowerCase() }`;
  }
}
