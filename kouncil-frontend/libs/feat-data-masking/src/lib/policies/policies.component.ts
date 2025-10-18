import {Component, OnDestroy, OnInit} from '@angular/core';
import {PoliciesService} from './policies.service';
import {SystemFunctionName} from '@app/common-auth';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {first} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {ProgressBarService, SearchService} from '@app/common-utils';
import {MaskingType, Policy} from "../policy.model";

@Component({
  selector: 'app-data-masking-policies',
  template: `
    <div class="main-container">
      <div class="toolbar-container">
        <div class="toolbar">
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
                        (cdkDropListDropped)="drop($event)">

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
      name: 'Masking type',
      prop: 'type',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300,
      valueFormatter: (value: MaskingType): string => MaskingType[value]
    },
    {
      name: 'Fields',
      prop: 'fields',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 300,
      valueFormatter: (value: Array<string>) => value.join(", ")
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
              private searchService: SearchService) {
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
    .subscribe((data: any) => {
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

}
