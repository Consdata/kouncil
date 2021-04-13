import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Topics } from "app/topics/topics";
import { Subscription } from "rxjs";
import { SearchService } from "app/search.service";
import { TopicMetadata } from "app/topics/topic-metadata";
import { ProgressBarService } from "../util/progress-bar.service";
import {SendPopupComponent} from "../send/send-popup.component";
import { ArraySortPipe } from "../util/array-sort.pipe";

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient,
              private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private arraySortPipe: ArraySortPipe) {
  }

  topics: TopicMetadata[] = [];
  grouped: TopicMetadata[] = [];
  filtered: TopicMetadata[] = [];
  @ViewChild('table') private table: ElementRef;
  @ViewChild(SendPopupComponent) popup;

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
    let favouritesStr = localStorage.getItem('kouncil-topics-favourites');
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
    localStorage.setItem('kouncil-topics-favourites', favourites.join());
    this.applyFavourites();
    this.filter(this.searchService.getCurrentPhrase());
  }

  openSendPopup(topicName) {
    this.popup.openPopup(topicName);
  }

  customSort(event) {
    this.filtered = this.arraySortPipe.transform(this.filtered, event.column.prop, event.newValue);
  }
}