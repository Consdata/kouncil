import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ClustersService} from './clusters.service';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {
  ProgressBarService,
  SearchService,
  SnackBarComponent,
  SnackBarData,
  SnackBarType
} from '@app/common-utils';
import {ClusterBroker, ClusterMetadata, Clusters} from '../cluster.model';
import {Router} from '@angular/router';
import {ConfirmService} from '@app/feat-confirm';
import {ClusterService} from '../cluster-form/cluster.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from '@app/common-servers';

@Component({
  selector: 'app-clusters',
  template: `
    <div class="main-container">
      <div class="toolbar-container">
        <div class="toolbar">
          <button mat-button *ngIf="authService.canAccess([SystemFunctionName.CLUSTER_CREATE])"
                  class="action-button-blue" (click)="createCluster()">
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
                <button *ngIf="authService.canAccess([SystemFunctionName.CLUSTER_DELETE])"
                        mat-button class="action-button-red"
                        (click)="$event.stopPropagation(); confirmDeleteCluster(element.id, element.name)">
                  Delete
                </button>
                <button *ngIf="authService.canAccess([SystemFunctionName.CLUSTER_UPDATE])"
                        mat-button class="action-button-white"
                        [routerLink]="['/clusters/cluster/', element.name, 'edit']">
                  Edit
                </button>
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
              private router: Router,
              private confirmService: ConfirmService,
              private clusterService: ClusterService,
              private snackbar: MatSnackBar,
              private serversService: ServersService,
              private cdr: ChangeDetectorRef,
              protected authService: AuthService) {
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

  confirmDeleteCluster(id: number, name: string): void {
    this.subscription.add(this.confirmService.openConfirmDialog$({
      title: 'Delete cluster',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `Cluster ${name}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.deleteCluster(id, name);
      }
    }));
  }

  private deleteCluster(id: number, clusterName: string) {
    this.subscription.add(this.clusterService.deleteCluster$(id)
    .pipe(first())
    .subscribe({
      next: () => {
        this.loadClusters();

        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Cluster ${clusterName} deleted`, SnackBarType.SUCCESS),
          panelClass: ['snackbar', 'snackbar-container-success'],
          duration: 1000
        });
        this.reloadServers();
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Cluster ${clusterName} couldn't be deleted`, SnackBarType.ERROR),
          panelClass: ['snackbar', 'snackbar-container-error'],
          duration: 3000
        });
        this.progressBarService.setProgress(false);
        this.reloadServers();
      }
    }));
  }

  private reloadServers(): void {
    this.subscription.add(this.snackbar._openedSnackBarRef.afterDismissed().subscribe(() => {
      this.serversService.load().then(() => this.cdr.detectChanges());
    }));
  }
}
