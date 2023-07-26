import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject, LOCALE_ID,
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
import {JsonGridData} from '../../topic/json-grid-data';
import {JsonGrid} from '../../topic/json-grid';

@Component({
  selector: 'app-track-result',
  template: `
    <ng-template #noDataPlaceholder>
      <app-no-data-placeholder
        [objectTypeName]="'Message'"
        #noDataPlaceholderComponent
      ></app-no-data-placeholder>
    </ng-template>

    <section *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
             class="track-table">
      <app-common-table [tableData]="filteredRows" [columns]="allColumns" matSort [sort]="sort"
                        cdkDropList cdkDropListOrientation="horizontal"
                        (cdkDropListDropped)="drop($event)"
                        (rowClickedAction)="showMessage($event)">
        <ng-container *ngFor="let column of allColumns; let index = index">
          <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
        </ng-container>
      </app-common-table>
    </section>
  `,
  styleUrls: ['./track-result.component.scss'],
  providers: [JsonGrid, DatePipe],
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

  allColumns: TableColumn[] = [];

  commonColumns: TableColumn[] = [
    {
      name: 'timestamp',
      prop: 'kouncilTimestamp',
      sticky: true,
      width: 215,
      resizeable: true,
      sortable: true,
      draggable: true,
      valueFormatter: (value: Date | string | number): string => new DatePipe(this.locale).transform(value, 'yyyy-MM-dd HH:mm:ss.SSS')
    },
    {
      name: 'topic',
      prop: 'kouncilTopic',
      sticky: true,
      width: 200,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'partition',
      prop: 'kouncilPartition',
      sticky: true,
      width: 100,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'offset',
      prop: 'kouncilOffset',
      sticky: true,
      width: 100,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'key',
      prop: 'kouncilKey',
      sticky: true,
      width: 150,
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
    private messageDataService: MessageDataService,
    private jsonGrid: JsonGrid,
    @Inject(LOCALE_ID) public locale: string
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

  private static tryParseJsonToRecord(message: string): Record<string, unknown> {
    try {
      const parsedMessage = JSON.parse(message);
      return parsedMessage && typeof parsedMessage === 'object' ? parsedMessage : {};
    } catch (e) {
      return {};
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
      value: event.kouncilValueJson && Object.keys(event.kouncilValueJson).length > 0 ?
        event.kouncilValueJson : event.kouncilValue,
      valueFormat: event.valueFormat,
      headers: event.headers,
      key: event.kouncilKeyJson && Object.keys(event.kouncilKeyJson).length > 0 ?
        event.kouncilKeyJson : event.kouncilKey,
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
      this.noDataPlaceholderComponent.currentPhrase = this.searchService.currentPhrase;
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
          const columnNames: Array<string> = this.generateGridColumnNames(events);

          const gridColumns: TableColumn[] = [];
          if (columnNames.length > 0) {

            columnNames.forEach((column) => {
              gridColumns.push({
                name: column,
                prop: column,
                sticky: false,
                resizeable: true,
                sortable: true,
                draggable: false,
                width: 200
              });
            });

            this.parseObjectValues(events);
          }

          let columns: TableColumn[] = [...this.commonColumns];
          if (gridColumns) {
            columns = columns.concat(gridColumns);
          }
          this.allColumns = columns;

          this.allRows = [...this.allRows, ...this.jsonGrid.getRows()];
          this.filterRows(this.searchService.currentPhrase);
        }
        if (!this.trackService.isAsyncEnable()) {
          this.trackService.trackFinished.emit();
        }
      });
    });
  }

  private generateGridColumnNames(events: MessageData[]): Array<string> {
    let columnNames: Array<string> = [];
    events.every(event => {
      const keys = Object.keys(TrackResultComponent.tryParseJson(event.value));
      if (columnNames.length === 0) {
        // empty list - add all object properties to possible column array
        columnNames = keys;
      } else {
        let copy = columnNames;
        columnNames.every(columnName => {
          if (!keys.includes(columnName)) {
            copy = copy.splice(copy.indexOf(columnName), 1);
          }
          return true;
        });
      }
      return true;
    });
    return columnNames;
  }

  private parseObjectValues(events: MessageData[]): void {
    const values: JsonGridData[] = [];
    events.forEach((event: MessageData) => {
      values.push({
        value: event.value,
        valueFormat: event.valueFormat,
        valueJson: TrackResultComponent.tryParseJsonToRecord(event.value),
        partition: event.partition,
        offset: event.offset,
        key: event.key,
        keyFormat: event.keyFormat,
        keyJson: TrackResultComponent.tryParseJsonToRecord(event.key),
        timestamp: event.timestamp,
        headers: event.headers,
        topic: event.topic
      } as JsonGridData);
    });
    this.jsonGrid.replaceObjects(values, false, false);
  }
}
