import {Component, OnInit} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Broker} from 'app/brokers/broker';
import {Subscription} from 'rxjs';
import {ProgressBarService} from 'app/util/progress-bar.service';
import {BrokerService} from './broker.service';
import {first} from 'rxjs/operators';
import {BrokerComponent} from '../broker/broker.component';
import {DrawerService} from '../util/drawer.service';
import {ServersService} from '../servers.service';

@Component({
  selector: 'app-kafka-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private brokerService: BrokerService,
              private drawerService: DrawerService,
              private servers: ServersService) {
  }

  allBrokers?: Broker[];
  filteredBrokers?: Broker[];
  private subscription?: Subscription;
  showJmxStats: boolean = false;

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.brokerService.getBrokers(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe(data => {
        this.allBrokers = data.brokers;
        this.filterRows(this.searchService.currentPhrase);
        this.filterJmxDetails();
        this.progressBarService.setProgress(false);
      });

    this.subscription = this.searchService.getPhraseState('brokers').subscribe(
      phrase => {
        this.filterRows(phrase);
      });
  }

  private filterJmxDetails(): void {
    this.showJmxStats = this.filteredBrokers!.filter(broker => broker.jmxStats).length > 0;
  }

  private filterRows(phrase?: string): void {
    this.filteredBrokers = this.allBrokers!.filter((broker) => {
      return !phrase || JSON.stringify(broker).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
    });
  }

  showBrokerDetails(event): void {
    if (event.type === 'click') {
      this.brokerService.getBrokerConfig(this.servers.getSelectedServerId(), event.row.id)
        .pipe(first())
        .subscribe(data => {
          this.drawerService.openDrawerWithoutPadding(BrokerComponent, {
            config: data
          }, '987px');
        });
    }
  }
}
