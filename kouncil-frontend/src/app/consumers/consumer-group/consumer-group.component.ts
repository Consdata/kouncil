import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from 'app/search.service';
import {interval, Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ConsumerGroupOffset, ConsumerGroupResponse} from 'app/consumers/consumer-group/consumer-group';
import {ProgressBarService} from '../../util/progress-bar.service';
import {ConsumerGroupService} from './consumer-group.service';
import {ServersService} from '../../servers.service';
import {switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-kafka-consumer-group',
  template: `
    <div class="kafka-consumer-group">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Consumer'"></app-no-data-placeholder>
      </ng-template>
      <app-breadcrumb [parentLink]="'/consumer-groups'" [name]="groupId"
                      [parentName]="'Consumer Groups'"></app-breadcrumb>
      <ngx-datatable *ngIf="filteredAssignments && filteredAssignments.length > 0; else noDataPlaceholder"
                     class="brokers-table material"
                     [rows]="filteredAssignments"
                     [rowHeight]="48"
                     [headerHeight]="48"
                     [scrollbarH]="false"
                     [scrollbarV]="false"
                     [columnMode]="'force'"
                     [loadingIndicator]="loading$ | async"
                     #table>
        <ngx-datatable-column prop="clientId" name="clientId">
          <ng-template let-row="row" ngx-datatable-cell-template>
            <cached-cell [property]="'clientId'" [row]="row" [showLastSeenTimestamp]="true"></cached-cell>
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="consumerId" name="consumerId">
          <ng-template let-row="row" ngx-datatable-cell-template>
            <cached-cell [property]="'consumerId'" [row]="row"></cached-cell>
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="host" name="host">
          <ng-template let-row="row" ngx-datatable-cell-template>
            <cached-cell [property]="'host'" [row]="row"></cached-cell>
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="topic" name="topic"></ngx-datatable-column>
        <ngx-datatable-column prop="partition" name="partition"></ngx-datatable-column>
        <ngx-datatable-column prop="offset" name="offset">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value | number }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="endOffset" name="endOffset">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value | number }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="lag" name="lag">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value | number }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="pace" name="pace">
          <ng-template let-value="value" ngx-datatable-cell-template>
            <div *ngIf="value == 0; then noPace else paceBlock"></div>
            <ng-template #noPace>=</ng-template>
            <ng-template #paceBlock>
              <div *ngIf="value > 0; then upperArrowBlock else downArrowBlock"></div>
              <ng-template #upperArrowBlock>↑ ({{ value | number }})</ng-template>
              <ng-template #downArrowBlock>↓ ({{ value | number }})</ng-template>
            </ng-template>
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./consumer-group.component.scss']
})
export class ConsumerGroupComponent implements OnInit, OnDestroy {

  private searchSubscription?: Subscription;
  private intervalSubscription?: Subscription;
  groupId: string;
  allAssignments: ConsumerGroupOffset[];
  filteredAssignments: ConsumerGroupOffset[];
  paused: boolean;
  lastLags: IHash = {};
  loading$: Observable<boolean> = this.progressBarService.loading$;

  constructor(private searchService: SearchService,
              private route: ActivatedRoute,
              private progressBarService: ProgressBarService,
              private consumerGroupService: ConsumerGroupService,
              private servers: ServersService) {
  }

  ngOnInit() {
    this.paused = false;
    this.progressBarService.setProgress(true);
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.getConsumerGroup();
    });

    this.searchSubscription = this.searchService.getPhraseState('consumer-group').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.intervalSubscription?.unsubscribe();
    this.paused = true;
  }

  private getConsumerGroup() {
    if (this.paused) {
      return;
    }
    this.intervalSubscription = interval(1000)
      .pipe(
        switchMap(() =>
          this.consumerGroupService.getConsumerGroup(this.servers.getSelectedServerId(), this.groupId)
            .pipe(
              tap((data: ConsumerGroupResponse) => {
                this.allAssignments = data.consumerGroupOffset;
                this.calculateLags();
                this.filter(this.searchService.currentPhrase);
                this.progressBarService.setProgress(false);
              })
            ))
      ).subscribe();
  }

  private filter(phrase: string) {
    this.filteredAssignments = this.allAssignments.filter((consumerGroupOffset) => {
      return !phrase || JSON.stringify(consumerGroupOffset).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
    });
  }

  private calculateLags() {
    this.allAssignments.forEach(assignment => {
      const lag: number = !!assignment.offset ? assignment.endOffset - assignment.offset : 0;
      assignment.lag = lag;
      const pace: number = lag - this.lastLags[this.getKey(assignment)];
      assignment.pace = isNaN(pace) ? 0 : pace;
      this.lastLags[this.getKey(assignment)] = lag;
    });
  }

  private getKey(assignment: ConsumerGroupOffset) {
    return this.servers.getSelectedServerId() + assignment.clientId + assignment.consumerId + assignment.topic + assignment.partition;
  }
}

export interface IHash {
  [details: string]: number;
}
