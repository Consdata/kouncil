import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs/Subscription";
import { SearchService } from "app/search.service";
import { ConsumerGroup, ConsumerGroupsResponse } from "app/consumers/consumer-groups/consumer-groups";

@Component({
  selector: 'kafka-consumer-groups',
  templateUrl: './consumer-groups.component.html',
  styleUrls: ['./consumer-groups.component.scss']
})
export class ConsumerGroupsComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient, private searchService: SearchService) {
  }

  consumerGroups: ConsumerGroup[] = [];
  grouped: ConsumerGroup[] = [];
  filtered: ConsumerGroup[] = [];
  @ViewChild('table') private table: ElementRef;

  private subscription: Subscription;

  ngOnInit() {
    this.http.get("/api/consumer-groups")
        .subscribe(data => {
          this.consumerGroups = (<ConsumerGroupsResponse> data).consumerGroups;
          this.applyFavourites();
          this.filter();
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
    this.filtered = this.consumerGroups.filter((consumerGroup) => {
      return !phrase || consumerGroup.groupId.indexOf(phrase) > -1
    });
  }

  private applyFavourites() {
    let favouritesStr = localStorage.getItem('kafka-companion-consumer-groups-favourites');
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
    })
  }

  onFavouriteClick(row) {
    if (row.group === ConsumerGroup.GROUP_FAVOURITES) {
      row.group = ConsumerGroup.GROUP_ALL;
    } else {
      row.group = ConsumerGroup.GROUP_FAVOURITES;
    }
    let favourites = this.consumerGroups.filter(consumerGroup => consumerGroup.group === ConsumerGroup.GROUP_FAVOURITES).map(
      consumerGroup => consumerGroup.groupId);
    localStorage.setItem('kafka-companion-consumer-groups-favourites', favourites.join());
    this.applyFavourites();
    this.filter(this.searchService.getCurrentPhrase());
  }
}
