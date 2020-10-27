import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SearchService } from "app/search.service";
import { Brokers } from "app/brokers/brokers";
import { Broker } from "app/brokers/broker";
import { Subscription } from "rxjs";

@Component({
  selector: 'kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private http: HttpClient, private searchService: SearchService) {
  }

  allBrokers: Broker[];
  filteredBrokers: Broker[];
  private subscription: Subscription;
  phrase: string;

  ngOnInit() {
    this.http.get("/api/brokers")
        .subscribe(data => {
          this.allBrokers = (<Brokers> data).brokers;
          this.filterRows();
        });

    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
  }

  private filterRows() {
    this.filteredBrokers = this.allBrokers.filter((broker) => {
      return !this.phrase || JSON.stringify(broker).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

}
