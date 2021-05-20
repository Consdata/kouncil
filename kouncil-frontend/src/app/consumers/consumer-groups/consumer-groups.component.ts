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
import {Servers} from '../../servers.service';

@Component({
  selector: 'kafka-consumer-groups',
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
              private servers: Servers) {
  }

  consumerGroups: ConsumerGroup[] = [];
  grouped: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];
  @ViewChild('table') private table: ElementRef;

  private subscription: Subscription;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.loadConsumerGroups();

    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  private loadConsumerGroups() {
    this.consumerGroupsService.getConsumerGroups(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe(data => {
        this.consumerGroups = (<ConsumerGroupsResponse>data).consumerGroups;
        this.applyFavourites();
        this.filter();
        this.progressBarService.setProgress(false);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private filter(phrase?) {
    this.filtered = this.consumerGroups.filter((consumerGroup) => {
      return !phrase || consumerGroup.groupId.indexOf(phrase) > -1;
    });
  }

  private applyFavourites() {
    const favouritesStr = localStorage.getItem('kouncil-consumer-groups-favourites');
    let favourites = [];
    if (favouritesStr) {
      favourites = favouritesStr.split(',');
    }
    this.consumerGroups.forEach(consumerGroup => {
      consumerGroup.group = favourites.indexOf(consumerGroup.groupId) > -1 ? ConsumerGroup.GROUP_FAVOURITES : ConsumerGroup.GROUP_ALL;
    });
    this.consumerGroups.sort((a, b) => {
      if (a.group === b.group) {
        return a.groupId.localeCompare(b.groupId);
      } else if (a.group === ConsumerGroup.GROUP_FAVOURITES) {
        return -1;
      } else if (b.group === ConsumerGroup.GROUP_FAVOURITES) {
        return 1;
      }
    });
  }

  onFavouriteClick(row) {
    if (row.group === ConsumerGroup.GROUP_FAVOURITES) {
      row.group = ConsumerGroup.GROUP_ALL;
    } else {
      row.group = ConsumerGroup.GROUP_FAVOURITES;
    }
    const favourites = this.consumerGroups.filter(consumerGroup => consumerGroup.group === ConsumerGroup.GROUP_FAVOURITES).map(
      consumerGroup => consumerGroup.groupId);
    localStorage.setItem('kouncil-consumer-groups-favourites', favourites.join());
    this.applyFavourites();
    this.filter(this.searchService.getCurrentPhrase());
  }

  deleteConsumerGroup(value) {
    this.confirmService.openConfirmDialog('consumer group', value)
      .pipe(first())
      .subscribe((confirmed) => {
        if (confirmed) {
          this.progressBarService.setProgress(true);
          this.consumerGroupsService.deleteConsumerGroup(this.servers.getSelectedServerId(), value)
            .pipe(first())
            .subscribe(data => {
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

  customSort(event) {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }
}
