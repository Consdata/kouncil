import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TopicMetadata} from 'app/topics/topics';
import {Subscription} from 'rxjs';
import {SearchService} from 'app/search.service';
import {ProgressBarService} from '../util/progress-bar.service';
import {ArraySortPipe} from '../util/array-sort.pipe';
import {TopicsService} from './topics.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {SendComponent} from '../send/send.component';
import {DrawerService} from '../util/drawer.service';
import {FavouritesService} from '../favourites.service';
import {ServersService} from '../servers.service';

const TOPICS_FAVOURITE_KEY = 'kouncil-topics-favourites';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
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
  @ViewChild('table') private table: ElementRef;

  private searchSubscription: Subscription;

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
      .subscribe(data => {
        this.topics = data.topics.map(t => new TopicMetadata(t.partitions, null, t.name));
        this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
        this.filter(this.searchService.currentPhrase);
        this.progressBarService.setProgress(false);
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  private filter(phrase: string): void {
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

  openSendPopup(name: string): void {
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: name
    });
  }

  customSort(event): void {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }
}
