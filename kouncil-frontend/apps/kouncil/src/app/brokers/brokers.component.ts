import {Component, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';
import {BrokerService} from './broker.service';
import {first} from 'rxjs/operators';
import {BrokerComponent} from '../broker/broker.component';
import {DrawerService} from '../util/drawer.service';
import {ServersService} from '../servers.service';
import {SearchService} from '../search.service';
import {ProgressBarService} from '../util/progress-bar.service';
import {Broker} from './broker';

@Component({
  selector: 'app-kafka-brokers',
  template: `
    <div class="kafka-brokers">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Broker'"></app-no-data-placeholder>
      </ng-template>
      <ngx-datatable *ngIf="filteredBrokers && filteredBrokers.length > 0; else noDataPlaceholder"
                     class="brokers-table material expandable"
                     [rows]="filteredBrokers"
                     [rowHeight]="48"
                     [headerHeight]="48"
                     [scrollbarH]="false"
                     [scrollbarV]="false"
                     [columnMode]="'force'"
                     (activate)="showBrokerDetails($event)"
                     #table>

        <ngx-datatable-column [width]="150" prop="id" name="ID"></ngx-datatable-column>
        <ngx-datatable-column [width]="200" prop="host" name="Host"></ngx-datatable-column>
        <ngx-datatable-column [width]="150" prop="port" name="Port"></ngx-datatable-column>
        <ngx-datatable-column prop="rack" name="Rack"></ngx-datatable-column>
        <ngx-datatable-column prop="system" name="System" *ngIf="showJmxStats"></ngx-datatable-column>
        <ngx-datatable-column prop="availableProcessors" name="CPUs" *ngIf="showJmxStats"></ngx-datatable-column>
        <ngx-datatable-column prop="systemLoadAverage" name="Load Average" *ngIf="showJmxStats">
          <ng-template let-value="value" ngx-datatable-cell-template>{{value ? value.toFixed(2) : ''}}</ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="freeMem" name="Free Mem" *ngIf="showJmxStats">
          <ng-template let-value="value" ngx-datatable-cell-template>{{value | fileSize}}</ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="totalMem" name="Total Mem" *ngIf="showJmxStats">
          <ng-template let-value="value" ngx-datatable-cell-template>{{value | fileSize}}</ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit {

  allBrokers?: Broker[];
  filteredBrokers?: Broker[];
  private subscription?: Subscription;
  showJmxStats: boolean = false;

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private brokerService: BrokerService,
              private drawerService: DrawerService,
              private servers: ServersService) {
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.brokerService.getBrokers$(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe(data => {
        this.allBrokers = data.brokers;
        this.filterRows(this.searchService.currentPhrase);
        this.filterJmxDetails();
        this.progressBarService.setProgress(false);
      });

    this.subscription = this.searchService.getPhraseState$('brokers').subscribe(
      phrase => {
        this.filterRows(phrase);
      });
  }

  private filterJmxDetails(): void {
    if (this.filteredBrokers) {
      this.showJmxStats = this.filteredBrokers.filter(broker => broker.jmxStats).length > 0;
    }
  }

  private filterRows(phrase?: string): void {
    if (this.allBrokers) {
      this.filteredBrokers = this.allBrokers.filter((broker) => {
        return !phrase || JSON.stringify(broker).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
      });
    }
  }

  showBrokerDetails(event): void {
    if (event.type === 'click') {
      this.brokerService.getBrokerConfig$(this.servers.getSelectedServerId(), event.row.id)
        .pipe(first())
        .subscribe(data => {
          this.drawerService.openDrawerWithoutPadding(BrokerComponent, {
            config: data
          }, '987px');
        });
    }
  }
}
