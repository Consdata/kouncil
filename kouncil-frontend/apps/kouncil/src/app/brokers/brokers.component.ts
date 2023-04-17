import {Component, OnInit} from '@angular/core';

import {Subscription} from 'rxjs';
import {BrokerService} from './broker.service';
import {first} from 'rxjs/operators';
import {BrokerComponent} from '../broker/broker.component';
import {Broker} from './broker';
import {DrawerService, ProgressBarService, SearchService} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {FileSizePipe} from './filze-size.pipe';

@Component({
  selector: 'app-kafka-brokers',
  template: `
    <div class="kafka-brokers">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Broker'"></app-no-data-placeholder>
      </ng-template>

      <section *ngIf="filteredBrokers && filteredBrokers.length > 0; else noDataPlaceholder">
        <app-common-table [tableData]="filteredBrokers" [columns]="columns"
                          (rowClickedAction)="showBrokerDetails($event)"
                          matSort [sort]="sort"
                          cdkDropList cdkDropListOrientation="horizontal"
                          (cdkDropListDropped)="drop($event)">
          <ng-container *ngFor="let column of columns; let index = index">
            <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
          </ng-container>


        </app-common-table>

      </section>
    </div>
  `,
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent extends AbstractTableComponent implements OnInit {

  allBrokers?: Broker[];
  filteredBrokers?: Broker[];
  private subscription?: Subscription;
  showJmxStats: boolean = false;

  columns: TableColumn[] = [
    {
      name: 'ID',
      prop: 'id',
      sticky: false,
      width: 150,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Host',
      prop: 'host',
      sticky: false,
      width: 200,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Port',
      prop: 'port',
      sticky: false,
      width: 150,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {name: 'Rack', prop: 'rack', sticky: false, resizeable: true, sortable: true, draggable: true},
  ];

  jmxColumns: TableColumn[] = [
    {
      name: 'System',
      prop: 'system',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'CPUs',
      prop: 'availableProcessors',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'Load Average',
      prop: 'systemLoadAverage',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => value ? value.toFixed(2) : ''
    },
    {
      name: 'Free Mem',
      prop: 'freeMem',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => new FileSizePipe().transform(value)
    },
    {
      name: 'Total Mem',
      prop: 'totalMem',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => new FileSizePipe().transform(value)
    },
  ];

  constructor(private searchService: SearchService,
              private progressBarService: ProgressBarService,
              private brokerService: BrokerService,
              private drawerService: DrawerService,
              private servers: ServersService) {
    super();
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
      if (this.showJmxStats) {
        this.columns = this.columns.concat(this.jmxColumns);
      }
    }
  }

  private filterRows(phrase?: string): void {
    if (this.allBrokers) {
      this.filteredBrokers = this.allBrokers.filter((broker) => {
        return !phrase || JSON.stringify(broker).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
      });
    }
  }

  showBrokerDetails(event: Broker): void {
    this.brokerService.getBrokerConfig$(this.servers.getSelectedServerId(), event.id)
    .pipe(first())
    .subscribe(data => {
      this.drawerService.openDrawerWithoutPadding(BrokerComponent, {
        config: data
      }, '987px');
    });
  }
}
