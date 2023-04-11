import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ConsumerGroupService} from './consumer-group.service';
import {switchMap, tap} from 'rxjs/operators';
import {ProgressBarService, SearchService} from '@app/common-utils';
import {ConsumerGroupOffset, ConsumerGroupResponse} from '@app/common-model';
import {ServersService} from '@app/common-servers';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-kafka-consumer-group',
  template: `
    <div class="kafka-consumer-group">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder
          [objectTypeName]="'Consumer'"
        ></app-no-data-placeholder>
      </ng-template>
      <app-breadcrumb
        [parentLink]="'/consumer-groups'"
        [name]="groupId"
        [parentName]="'Consumer Groups'"
      ></app-breadcrumb>
      <section
        *ngIf="filteredAssignments && filteredAssignments.length > 0; else noDataPlaceholder">
        <app-common-table [tableData]="filteredAssignments" matSort [columns]="columns"
                          [additionalColumns]="additionalColumns"
                          cdkDropList cdkDropListOrientation="horizontal"
                          (cdkDropListDropped)="drop($event)">

          <ng-container *ngFor="let column of additionalColumns; let index = index">
            <app-common-table-column [column]="column" [index]="index"
                                     [template]="cellTemplate">

              <ng-template #cellTemplate let-element>
                <app-cached-cell [property]="column.prop"
                                 [row]="element"
                                 [showLastSeenTimestamp]="true"
                ></app-cached-cell>
              </ng-template>
            </app-common-table-column>
          </ng-container>

          <ng-container *ngFor="let column of columns; let index = index">
            <app-common-table-column [column]="column"
                                     [index]="index + additionalColumns.length"></app-common-table-column>
          </ng-container>
        </app-common-table>
      </section>
    </div>
  `,
  styleUrls: ['./consumer-group.component.scss'],
})
export class ConsumerGroupComponent extends AbstractTableComponent implements OnInit, OnDestroy {
  private searchSubscription?: Subscription;
  private intervalSubscription?: Subscription;
  groupId: string = '';
  allAssignments: ConsumerGroupOffset[] = [];
  filteredAssignments: ConsumerGroupOffset[] = [];
  paused: boolean = false;
  lastLags: IHash = {};
  loading$: Observable<boolean> = this.progressBarService.loading$;

  additionalColumns: TableColumn[] = [
    {
      name: 'clientId',
      prop: 'clientId',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'consumerId',
      prop: 'consumerId',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'host',
      prop: 'host',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
  ];

  columns: TableColumn[] = [
    {
      name: 'topic',
      prop: 'topic',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'partition',
      prop: 'partition',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'offset',
      prop: 'offset',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => new DecimalPipe(this.locale).transform(value)
    },
    {
      name: 'endOffset',
      prop: 'endOffset',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => new DecimalPipe(this.locale).transform(value)
    },
    {
      name: 'lag',
      prop: 'lag',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => new DecimalPipe(this.locale).transform(value)
    },
    {
      name: 'pace',
      prop: 'pace',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: number): string => {
        if (value === 0) {
          return '=';
        } else {
          if (value > 0) {
            return `↑ ${new DecimalPipe(this.locale).transform(value)}`;
          } else {
            return `↓ ${new DecimalPipe(this.locale).transform(value)}`;
          }
        }
      }
    },
  ];

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private progressBarService: ProgressBarService,
    private consumerGroupService: ConsumerGroupService,
    private servers: ServersService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    super();
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      this.getConsumerGroup();
    });

    this.searchSubscription = this.searchService
    .getPhraseState$('consumer-group')
    .subscribe((phrase) => {
      this.filter(phrase);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.intervalSubscription?.unsubscribe();
    this.paused = true;
  }

  private getConsumerGroup(): void {
    if (this.paused) {
      return;
    }
    this.intervalSubscription = interval(1000)
    .pipe(
      switchMap(() =>
        this.consumerGroupService
        .getConsumerGroup$(this.servers.getSelectedServerId(), this.groupId)
        .pipe(
          tap((data: ConsumerGroupResponse) => {
            this.allAssignments = data.consumerGroupOffset;
            this.calculateLags();
            this.filter(this.searchService.currentPhrase);
            this.progressBarService.setProgress(false);
          })
        )
      )
    )
    .subscribe();
  }

  private filter(phrase?: string): void {
    this.filteredAssignments = this.allAssignments.filter(
      (consumerGroupOffset) => {
        return (
          !phrase ||
          JSON.stringify(consumerGroupOffset)
          .toLowerCase()
          .indexOf(phrase.toLowerCase()) > -1
        );
      }
    );
  }

  private calculateLags(): void {
    this.allAssignments.forEach((assignment) => {
      const lag: number = assignment.offset
        ? assignment.endOffset - assignment.offset
        : 0;
      assignment.lag = lag;
      const pace: number = lag - this.lastLags[this.getKey(assignment)];
      assignment.pace = isNaN(pace) ? 0 : pace;
      this.lastLags[this.getKey(assignment)] = lag;
    });
  }

  private getKey(assignment: ConsumerGroupOffset): string {
    return (
      this.servers.getSelectedServerId() +
      assignment.clientId +
      assignment.consumerId +
      assignment.topic +
      assignment.partition
    );
  }
}

export interface IHash {
  [details: string]: number;
}
