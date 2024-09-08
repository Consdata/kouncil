import {Component, OnDestroy, OnInit} from '@angular/core';
import {ClustersService} from './clusters.service';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ProgressBarService, SearchService} from '@app/common-utils';
import {SystemFunctionName} from '@app/common-auth';
import {ClusterBroker, ClusterMetadata, Clusters} from '../cluster.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-clusters',
  template: `
    <div class="main-container">
      <div class="toolbar-container">
        <div class="toolbar">
          <button mat-button class="action-button-blue" (click)="createCluster()">
            Add new cluster
          </button>
        </div>
      </div>
    </div>

    <div class="clusters" *ngIf="clusters">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Clusters'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="filtered && filtered.length > 0; else noDataPlaceholder"
                        [tableData]="filtered" [columns]="columns"
                        [actionColumns]="actionColumns"
                        matSort [sort]="sort"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)"
                        (rowClickedAction)="navigateToDetails($event)">

        <ng-container *ngFor="let column of columns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index"></app-common-table-column>
        </ng-container>

        <ng-container *ngFor="let column of actionColumns; let index = index">
          <app-common-table-column [column]="column"
                                   [index]="index + columns.length"
                                   [template]="cellTemplate">
            <ng-template #cellTemplate let-element>
              <div class="actions-column">
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>
      </app-common-table>
    </div>
  `,
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;

  clusters: ClusterMetadata[] = [];
  filtered: ClusterMetadata[] = [];

  columns: TableColumn[] = [
    {
      name: 'Name',
      prop: 'name',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300
    },
    {
      name: 'Brokers',
      prop: 'brokers',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300,
      valueFormatter: (value: Array<ClusterBroker>): string => value.map(broker => broker.bootstrapServer).join(', ')
    }
  ];

  actionColumns: TableColumn[] = [
    {
      name: ' ',
      prop: 'actions',
      sticky: false,
      resizeable: false,
      sortable: false,
      draggable: false,
      width: 150
    }
  ];

  private subscription: Subscription = new Subscription();

  constructor(private clustersService: ClustersService,
              private progressBarService: ProgressBarService,
              private searchService: SearchService,
              private router: Router) {
    super();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadClusters();
    this.subscription.add(this.searchService.getPhraseState$('clusters')
    .subscribe(phrase => {
      this.filter(phrase);
    }));
  }


  private loadClusters(): void {
    this.subscription.add(this.clustersService.getClusters$()
    .pipe(first())
    .subscribe((data: Clusters) => {
      this.clusters = data.clusters;
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    }));
  }

  navigateToDetails(cluster: ClusterMetadata): void {
    this.router.navigate([`/clusters/cluster/${cluster.name}`]);
  }

  createCluster(): void {
    this.router.navigate([`/clusters/cluster`]);
  }

  private filter(phrase?: string): void {
    this.filtered = this.clusters.filter((clusterMetaData) => {
      return !phrase || clusterMetaData.name.indexOf(phrase) > -1;
    });
  }
}
