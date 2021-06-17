import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Brokers} from 'app/brokers/brokers';
import {Broker, BrokerConfig} from 'app/brokers/broker';
import {Subscription} from 'rxjs';
import {ProgressBarService} from 'app/util/progress-bar.service';
import {BrokerService} from './broker.service';
import {first} from 'rxjs/operators';
import {BrokerComponent} from '../broker/broker.component';
import {DrawerService} from '../util/drawer.service';
import {Servers} from '../servers.service';

@Component({
  selector: 'kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private brokerService: BrokerService,
              private drawerService: DrawerService,
              private servers: Servers) {
  }

  @ViewChild('table') table: any;
  allBrokers: Broker[];
  filteredBrokers: Broker[];
  private subscription: Subscription;
  phrase: string;
  showJmxStats = false;

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.brokerService.getBrokers(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe(data => {
        this.allBrokers = (<Brokers>data).brokers;
        this.filterRows();
        this.filterJmxDetails();
        this.progressBarService.setProgress(false);
      });

    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
  }

  private filterJmxDetails() {
    this.showJmxStats = this.filteredBrokers.filter(broker => broker.jmxStats).length > 0;
  }

  private filterRows() {
    this.filteredBrokers = this.allBrokers.filter((broker) => {
      return !this.phrase || JSON.stringify(broker).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  showBrokerDetails(event) {
    if (event.type === 'click') {
      this.brokerService.getBrokerConfig(this.servers.getSelectedServerId(), event.row.id)
        .pipe(first())
        .subscribe(data => {
          const brokerConfig = <BrokerConfig[]>data;
          this.drawerService.openDrawerWithoutPadding(BrokerComponent, {
            config: brokerConfig
          });
        });
    }


  }
}
