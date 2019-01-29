import {Component, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SearchService } from "app/search.service";
import { Brokers } from "app/brokers/brokers";
import {Broker, BrokerConfig} from "app/brokers/broker";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private http: HttpClient, private searchService: SearchService) {
  }
  @ViewChild('table') table: any;
  allBrokers: Broker[];
  filteredBrokers: Broker[];
  brokerConfigs: BrokerConfig[];
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

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row.id);
    this.http.get("/api/configs/" + row.id)
      .subscribe(data => {
        console.log('Detail Toggled', data);
        row.config = <BrokerConfig[]> data;
        this.table.rowDetail.toggleExpandRow(row);
      });

  }

  getRowHeight(row) {
    console.log('getRowHeight', row);
    if(!row) return 50;
    if(row.config === undefined) return 50;
    return row.config.size * 10;
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

}
