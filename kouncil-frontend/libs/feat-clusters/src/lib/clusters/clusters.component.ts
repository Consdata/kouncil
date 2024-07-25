import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ClustersService} from './clusters.service';
import {AuthService, KouncilRole} from '@app/common-auth';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ProgressBarService, SnackBarComponent, SnackBarData} from '@app/common-utils';
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
          <button mat-button class="action-button-blue" (click)="createCluster()">
            Add new cluster
          </button>
        </div>
      </div>
    </div>

    <div class="clusters" *ngIf="clusters">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Topic'"></app-no-data-placeholder>
      </ng-template>

      <app-common-table *ngIf="clusters && clusters.length > 0; else noDataPlaceholder"
                        [tableData]="clusters" [columns]="columns"
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
                <button *ngIf="authService.canAccess([KouncilRole.CLUSTER_DELETE])"
                        mat-button class="action-button-red"
                        (click)="$event.stopPropagation(); confirmDeleteCluster(element.id, element.name)">
                  Delete
                </button>
                <button *ngIf="authService.canAccess([KouncilRole.CLUSTER_UPDATE])"
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

  KouncilRole: typeof KouncilRole = KouncilRole;

  clusters: ClusterMetadata[] = [];

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
  }


  private loadClusters(): void {
    this.subscription.add(this.clustersService.getClusters$()
    .pipe(first())
    .subscribe((data: Clusters) => {
      this.clusters = data.clusters;
      this.progressBarService.setProgress(false);
    }));
  }

  navigateToDetails(cluster: ClusterMetadata): void {
    this.router.navigate([`/clusters/cluster/${cluster.name}`]);
  }

  createCluster(): void {
    this.router.navigate([`/clusters/cluster`]);
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
    this.subscription.add(this.clusterService.deleteTopic$(id)
    .pipe(first())
    .subscribe({
      next: () => {
        this.loadClusters();
        this.serversService.load().then(() => this.cdr.detectChanges());

        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Cluster ${clusterName} deleted`, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Cluster ${clusterName} couldn't be deleted`, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
        this.progressBarService.setProgress(false);
      }
    }));
  }
}
