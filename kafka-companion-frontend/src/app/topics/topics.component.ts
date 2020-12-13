import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Topics } from "app/topics/topics";
import { Subscription } from "rxjs";
import { SearchService } from "app/search.service";
import { TopicMetadata } from "app/topics/topic-metadata";
import { ProgressBarService } from "../util/progress-bar.service";

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient, private searchService: SearchService, private progressBarService: ProgressBarService) {
  }

  topics: TopicMetadata[] = [];
  grouped: TopicMetadata[] = [];
  filtered: TopicMetadata[] = [];
  @ViewChild('table') private table: ElementRef;

  private subscription: Subscription;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.http.get("/api/topics")
        .subscribe(data => {
          this.topics = (<Topics> data).topics;
          this.applyFavourites();
          this.filter();
          this.progressBarService.setProgress(false);
        });

    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private filter(phrase?) {
    this.filtered = this.topics.filter((topicsMetadata) => {
      return !phrase || topicsMetadata.name.indexOf(phrase) > -1
    });
  }

  private applyFavourites() {
    let favouritesStr = localStorage.getItem('kafka-companion-topics-favourites');
    let favourites = [];
    if (favouritesStr) {
      favourites = favouritesStr.split(',');
    }
    this.topics.forEach(topic => {
      topic.group = favourites.indexOf(topic.name) > -1 ? TopicMetadata.GROUP_FAVOURITES : TopicMetadata.GROUP_ALL;
    });
    this.topics.sort((a, b) => {
      if (a.group === b.group) {
        return a.name.localeCompare(b.name);
      } else if (a.group === TopicMetadata.GROUP_FAVOURITES) {
        return -1;
      } else if (b.group === TopicMetadata.GROUP_FAVOURITES) {
        return 1;
      }
    })
  }

  onFavouriteClick(row) {
    if (row.group === TopicMetadata.GROUP_FAVOURITES) {
      row.group = TopicMetadata.GROUP_ALL;
    } else {
      row.group = TopicMetadata.GROUP_FAVOURITES;
    }
    let favourites = this.topics.filter(topic => topic.group === TopicMetadata.GROUP_FAVOURITES).map(topic => topic.name);
    localStorage.setItem('kafka-companion-topics-favourites', favourites.join());
    this.applyFavourites();
    this.filter(this.searchService.getCurrentPhrase());
  }
}
