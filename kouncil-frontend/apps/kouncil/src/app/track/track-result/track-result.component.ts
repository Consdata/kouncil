import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {MessageViewComponent} from '../../topic/message/message-view.component';
import {TrackService} from '../track.service';
import {TrackFilter} from '../track-filter/track-filter';
import {RxStompService} from '@stomp/ng2-stompjs';
import {Model} from '@swimlane/ngx-datatable';
import {MessageData, MessageDataService} from '@app/message-data';
import {DrawerService, ProgressBarService, Crypto, SearchService} from '@app/common-utils';
import {NoDataPlaceholderComponent} from '@app/feat-no-data';
import {ServersService} from '@app/common-servers';

@Component({
  selector: 'app-track-result',
  template: `
    <div class="track">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder
          [objectTypeName]="'Message'"
          #noDataPlaceholderComponent
        ></app-no-data-placeholder>
      </ng-template>
      <ngx-datatable
        *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
        class="track-table material expandable"
        [rows]="filteredRows"
        [rowHeight]="48"
        [headerHeight]="48"
        [footerHeight]="0"
        [scrollbarH]="true"
        [scrollbarV]="true"
        [columnMode]="'force'"
        [loadingIndicator]="loading$ | async"
        (activate)="showMessage($event)"
        #table
      >
        <ngx-datatable-column prop="timestamp" name="timestamp" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value | date: 'yyyy-MM-dd HH:mm:ss.SSS' }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="topic" name="topic" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="partition" name="partition" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="offset" name="offset" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value }}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column prop="key" name="key" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{ value }}
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
    </div>
  `,
  styleUrls: ['./track-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // otherwise ngx datatable flickers like hell
})
export class TrackResultComponent implements OnInit, OnDestroy {
  @ViewChild('noDataPlaceholderComponent')
  noDataPlaceholderComponent?: NoDataPlaceholderComponent;
  searchSubscription?: Subscription;
  trackFilterSubscription?: Subscription;
  topicSubscription?: Subscription;
  filteredRows: unknown[] = [];
  allRows: unknown[] = [];
  asyncHandle?: string;

  loading$: Observable<boolean> = this.progressBarService.loading$;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private titleService: Title,
    private progressBarService: ProgressBarService,
    private trackService: TrackService,
    private drawerService: DrawerService,
    private servers: ServersService,
    private rxStompService: RxStompService,
    private changeDetectorRef: ChangeDetectorRef,
    private messageDataService: MessageDataService
  ) {
  }

  private static tryParseJson(message: string): string {
    try {
      return JSON.parse(message);
    } catch (e) {
      return message;
    }
  }

  private static getDestination(asyncHandle: string): string {
    return '/topic/track/' + asyncHandle;
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchService
      .getPhraseState$('track')
      .subscribe((phrase) => {
        this.filterRows(phrase);
      });
    this.trackFilterSubscription =
      this.trackService.trackFilterObservable$.subscribe((trackFilter) => {
        this.getEvents(trackFilter);
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.trackFilterSubscription?.unsubscribe();
    this.topicSubscription?.unsubscribe();
  }

  onMessageReceived(message: { body: string }): void {
    this.filteredRows = [];
    setTimeout(() => {
      const items = JSON.parse(message.body);
      if (items.length === 0) {
        this.trackService.trackFinished.emit();
        this.topicSubscription?.unsubscribe();
      }
      this.allRows = [...this.allRows, ...items];
      this.filterRows(this.searchService.currentPhrase);
    });
  }

  showMessage(event: Model): void {
    if (event.type === 'click') {
      const messageData = {
        value: TrackResultComponent.tryParseJson(event.row.value),
        valueFormat: event.row.valueFormat,
        headers: event.row.headers,
        key: TrackResultComponent.tryParseJson(event.row.key),
        keyFormat: event.row.keyFormat,
        topicName: event.row.topic
      } as MessageData;
      this.messageDataService.setMessageData(messageData);
      this.drawerService.openDrawerWithPadding(MessageViewComponent);
    }
  }

  private filterRows(phrase?: string): void {
    this.filteredRows = this.allRows.filter((row) => {
      return (
        !phrase ||
        JSON.stringify(row).toLowerCase().indexOf(phrase.toLowerCase()) > -1
      );
    });

    this.changeDetectorRef.detectChanges();
    if (this.noDataPlaceholderComponent) {
      this.noDataPlaceholderComponent.currentPhrase =
        this.searchService.currentPhrase;
      this.noDataPlaceholderComponent.detectChanges();
    }
  }

  private getEvents(trackFilter: TrackFilter): void {
    if (this.trackService.isAsyncEnable()) {
      this.asyncHandle = Crypto.uuidv4();
      this.topicSubscription?.unsubscribe();
      this.topicSubscription = this.rxStompService
        .watch(TrackResultComponent.getDestination(this.asyncHandle))
        .subscribe((message) => {
          this.onMessageReceived(message);
        });
    } else {
      this.asyncHandle = null;
    }
    this.filteredRows = [];
    this.allRows = [];
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.trackService
        .getEvents$(
          this.servers.getSelectedServerId(),
          trackFilter,
          this.asyncHandle
        )
        .subscribe((events: MessageData[]) => {
          if (events && events.length > 0) {
            this.allRows = [...this.allRows, ...events];
            this.filterRows(this.searchService.currentPhrase);
          }
          if (!this.trackService.isAsyncEnable()) {
            this.trackService.trackFinished.emit();
          }
        });
    });
  }
}
