import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {MessageViewComponent} from '../../topic/message/message-view.component';
import {TrackService} from '../track.service';
import {TrackFilter} from '../track-filter/track-filter';
import {MessageData, MessageDataService} from '@app/message-data';
import {Crypto, DrawerService, ProgressBarService, SearchService} from '@app/common-utils';
import {NoDataPlaceholderComponent} from '@app/feat-no-data';
import {ServersService} from '@app/common-servers';
import {RxStompService} from '../../rx-stomp.service';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {DatePipe} from '@angular/common';

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

      <section *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
               class="track-table">
        <app-common-table [tableData]="filteredRows" [columns]="columns" matSort
                          cdkDropList cdkDropListOrientation="horizontal"
                          (cdkDropListDropped)="drop($event)"
                          (rowClickedAction)="showMessage($event)">
          <ng-container *ngFor="let column of columns; let index = index">
            <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
          </ng-container>
        </app-common-table>
      </section>
    </div>
  `,
  styleUrls: ['./track-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // otherwise ngx datatable flickers like hell
})
export class TrackResultComponent extends AbstractTableComponent implements OnInit, OnDestroy {
  @ViewChild('noDataPlaceholderComponent')
  noDataPlaceholderComponent?: NoDataPlaceholderComponent;
  searchSubscription?: Subscription;
  trackFilterSubscription?: Subscription;
  topicSubscription?: Subscription;
  filteredRows: unknown[] = [];
  allRows: unknown[] = [];
  asyncHandle?: string;

  columns: TableColumn[] = [
    {
      name: 'timestamp',
      prop: 'timestamp',
      sticky: false,
      width: 190,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: Date | string | number): string => new DatePipe(navigator.language).transform(value, 'yyyy-MM-dd HH:mm:ss.SSS')
    },
    {
      name: 'topic',
      prop: 'topic',
      sticky: false,
      width: 190,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'partition',
      prop: 'partition',
      sticky: false,
      width: 190,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'offset',
      prop: 'offset',
      sticky: false,
      width: 190,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'key',
      prop: 'key',
      sticky: false,
      width: 190,
      resizeable: true,
      sortable: true,
      draggable: true
    }
  ];

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
    super();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  showMessage(event: any): void {
    const messageData = {
      value: TrackResultComponent.tryParseJson(event.value),
      valueFormat: event.valueFormat,
      headers: event.headers,
      key: TrackResultComponent.tryParseJson(event.key),
      keyFormat: event.keyFormat,
      topicName: event.topic
    } as MessageData;
    this.messageDataService.setMessageData(messageData);
    this.drawerService.openDrawerWithPadding(MessageViewComponent);
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
