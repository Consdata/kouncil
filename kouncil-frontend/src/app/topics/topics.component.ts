import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TopicMetadata, Topics} from 'app/topics/topics';
import {Subscription} from 'rxjs';
import {SearchService} from 'app/search.service';
import {ProgressBarService} from '../util/progress-bar.service';
import {ArraySortPipe} from '../util/array-sort.pipe';
import {TopicsService} from './topics.service';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {SendComponent} from '../send/send.component';
import {DrawerService} from '../util/drawer.service';
import {Servers} from '../servers.service';
import {FavouritesService} from '../favourites.service';

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
              private servers: Servers,
              private favouritesService: FavouritesService) {
  }

  topics: TopicMetadata[] = [];
  filtered: TopicMetadata[] = [];
  @ViewChild('table') private table: ElementRef;

  private subscription: Subscription;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.loadTopics();
    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  private loadTopics() {
    this.topicsService.getTopics(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe(data => {
        this.topics = data.topics.map( t => new TopicMetadata(t.partitions, null, t.name));
        this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
        this.filter();
        this.progressBarService.setProgress(false);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private filter(phrase?) {
    this.filtered = this.topics.filter((topicsMetadata) => {
      return !phrase || topicsMetadata.name.indexOf(phrase) > -1;
    });
  }

  onFavouriteClick(row) {
    this.favouritesService.updateFavourites(row, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
    this.favouritesService.applyFavourites(this.topics, TOPICS_FAVOURITE_KEY, this.servers.getSelectedServerId());
    this.filter(this.searchService.getCurrentPhrase());
  }

  navigateToTopic(event): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.router.navigate(['/topics/messages', event.row.name]);
    }
  }

  openSendPopup(name: string) {
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: name
    });
  }

  customSort(event) {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }
}
