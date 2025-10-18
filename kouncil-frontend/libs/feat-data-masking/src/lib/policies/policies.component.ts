import {Component, OnDestroy, OnInit} from '@angular/core';
import {PoliciesService} from './policies.service';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {
  ProgressBarService,
  SearchService,
  SnackBarComponent,
  SnackBarData
} from '@app/common-utils';
import {Policy, PolicyField} from '../policy.model';
import {ConfirmService} from '@app/feat-confirm';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PolicyService} from '../policy/policy.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-data-masking-policies',
  template: `
    <div class="main-container" *ngIf="authService.canAccess([SystemFunctionName.POLICY_CREATE])">
      <div class="toolbar-container">
        <div class="toolbar">
          <button mat-button class="action-button-blue"
                  (click)="createPolicy()">
            Add new policy
          </button>
        </div>
      </div>
    </div>

    <div class="clusters" *ngIf="policies">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Policies'"></app-no-data-placeholder>
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
                <button
                  *ngIf="authService.canAccess([SystemFunctionName.POLICY_DELETE])"
                  mat-button class="action-button-red"
                  (click)="$event.stopPropagation(); confirmDeletePolicy(element.id, element.name)">
                  Delete
                </button>
                <button *ngIf="authService.canAccess([SystemFunctionName.POLICY_UPDATE])"
                        mat-button class="action-button-white"
                        [routerLink]="['/data-masking-policy', element.id, 'edit']">
                  Edit
                </button>
              </div>
            </ng-template>
          </app-common-table-column>
        </ng-container>
      </app-common-table>
    </div>
  `,
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;

  filtered: Array<Policy>;
  policies: Array<Policy>;

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
      name: 'Fields',
      prop: 'fields',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300,
      valueFormatter: (value: Array<PolicyField>): string => value.map(field => field.field).join(', ')
    },
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

  constructor(private dataMaskingPoliciesService: PoliciesService,
              private progressBarService: ProgressBarService,
              private searchService: SearchService,
              private confirmService: ConfirmService,
              private snackbar: MatSnackBar,
              private policyService: PolicyService,
              private router: Router,
              protected authService: AuthService) {
    super();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.loadPolicies();
    this.subscription.add(this.searchService.getPhraseState$('clusters')
    .subscribe(phrase => {
      this.filter(phrase);
    }));
  }

  private loadPolicies(): void {
    this.subscription.add(this.dataMaskingPoliciesService.getPolicies$()
    .pipe(first())
    .subscribe((data: Array<Policy>) => {
      this.policies = data;
      this.filter(this.searchService.currentPhrase);
      this.progressBarService.setProgress(false);
    }));
  }

  private filter(phrase?: string): void {
    this.filtered = this.policies.filter((policy: Policy) => {
      return !phrase || policy.name.indexOf(phrase) > -1;
    });
  }

  confirmDeletePolicy(id: number, name: string): void {
    this.subscription.add(this.confirmService.openConfirmDialog$({
      title: 'Delete policy',
      subtitle: 'Are you sure you want to delete:',
      sectionLine1: `Policy ${name}`
    })
    .pipe(first())
    .subscribe((confirmed) => {
      if (confirmed) {
        this.progressBarService.setProgress(true);
        this.deletePolicy(id, name);
      }
    }));
  }

  private deletePolicy(id: number, name: string): void {
    this.subscription.add(this.policyService.deletePolicy$(id)
    .pipe(first())
    .subscribe({
      next: () => {
        this.loadPolicies();

        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Policy ${name} deleted`, 'snackbar-success', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
      },
      error: () => {
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Policy ${name} couldn't be deleted`, 'snackbar-error', ''),
          panelClass: ['snackbar'],
          duration: 3000
        });
        this.progressBarService.setProgress(false);
      }
    }));
  }

  createPolicy(): void {
    this.router.navigate([`/data-masking-policy`]);
  }

  navigateToDetails(policy: Policy): void {
    this.router.navigate([`data-masking-policy/${policy.id}`]);
  }
}
