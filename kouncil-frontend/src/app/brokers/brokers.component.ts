import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Brokers} from 'app/brokers/brokers';
import {Broker, BrokerConfig} from 'app/brokers/broker';
import {Subscription} from 'rxjs';
import {ProgressBarService} from 'app/util/progress-bar.service';
import {BrokerService} from './broker.service';
import {first} from 'rxjs/operators';

@Component({
  selector: 'kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private brokerService: BrokerService) {
  }

  @ViewChild('table') table: any;
  allBrokers: Broker[];
  filteredBrokers: Broker[];
  private subscription: Subscription;
  phrase: string;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.brokerService.getBrokers()
      .pipe(first())
      .subscribe(data => {
        this.allBrokers = (<Brokers>data).brokers;
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
    this.brokerService.getBrokerConfig(row.id)
      .pipe(first())
      .subscribe(data => {
        row.config = <BrokerConfig[]>data;
        this.table.rowDetail.toggleExpandRow(row);
      });

  }
}
