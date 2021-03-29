import {Component, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SearchService } from "app/search.service";
import { Brokers } from "app/brokers/brokers";
import {Broker, BrokerConfig} from "app/brokers/broker";
import { Subscription } from "rxjs";
import {ProgressBarService} from "app/util/progress-bar.service";

@Component({
  selector: 'kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private http: HttpClient, private searchService: SearchService, private progressBarService: ProgressBarService) {
  }
  @ViewChild('table') table: any;
  allBrokers: Broker[];
  filteredBrokers: Broker[];
  private subscription: Subscription;
  phrase: string;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.http.get("/api/brokers")
        .subscribe(data => {
          this.allBrokers = (<Brokers> data).brokers;
          this.filterRows();
          this.progressBarService.setProgress(false);
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

  toggleExpandRow(row) {
    this.http.get("/api/configs/" + row.id)
      .subscribe(data => {
        row.config = <BrokerConfig[]> data;
        this.table.rowDetail.toggleExpandRow(row);
      });

  }
}
