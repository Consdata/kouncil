import {Component, OnDestroy, OnInit,} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {DatePipe, Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {TopicService, topicServiceProvider} from './topic.service';
import {Page} from './page';
import {ResendComponent} from '@app/resend-events';
import {MessageViewComponent} from './message/message-view.component';
import {LiveUpdateState} from './toolbar/topic-toolbar.component';
import {JsonGridData} from './json-grid-data';
import {Observable, Subscription} from 'rxjs';
import {JsonGrid} from './json-grid';
import {TopicMessages} from './topic-messages';
import {MessageData, MessageDataService} from '@app/message-data';
import {DrawerService, ProgressBarService, SearchService} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {SendComponent} from '@app/feat-send';
import {AbstractTableComponent, TableColumn} from '@app/common-components';

@Component({
  selector: 'app-topic',
  template: `
    <div class="topic">
      <div class="topic-table-area">
        <div class="topic-toolbar-area">
          <app-kafka-toolbar [name]="topicName"
                             (toggleLiveEvent)="toggleLiveEventHandler($event)"
                             (openSendPopupEvent)="openSendPopup()"
                             (openResendPopupEvent)="openResendPopup()"
                             (toggleHeadersEvent)="toggleHeadersEventHandler($event)"
                             (toggleJsonEvent)="toggleJsonEventHandler($event)">
          </app-kafka-toolbar>
        </div>

        <ng-template #noDataPlaceholder>
          <app-no-data-placeholder [objectTypeName]="'Message'"></app-no-data-placeholder>
        </ng-template>

        <section class="topic-table"
                 *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder">

          <app-common-table [tableData]="filteredRows" [columns]="columns"
                            (rowClickedAction)="showMessage($event)" matSort [sort]="sort"
                            cdkDropList cdkDropListOrientation="horizontal"
                            (cdkDropListDropped)="drop($event)">
            <ng-container *ngFor="let column of columns; let index = index">
              <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
            </ng-container>
          </app-common-table>

        </section>
        <app-topic-pagination *ngIf="filteredRows && filteredRows.length > 0;"
                              class="topic-pagination"
                              [paging]="paging$ | async"
                              [topicName]="topicName"
                              (changeQueryParams)="updateQueryParams($event)"
        ></app-topic-pagination>
      </div>
    </div>
  `,
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe, topicServiceProvider],
})
export class TopicComponent extends AbstractTableComponent implements OnInit, OnDestroy {

  topicName: string = '';
  columns: TableColumn[] = [];
  commonColumns: TableColumn[] = [];
  headerColumns: TableColumn[] = [];
  jsonColumns: TableColumn[] = [];
  valueColumns: TableColumn[] = [];
  showHeaderColumns: boolean = true;
  showJsonColumns: boolean = true;
  allRows: unknown[] = [];
  filteredRows: unknown[] = [];

  searchSubscription?: Subscription;
  jsonToGridSubscription?: Subscription;

  paused: boolean = false;

  paging$: Observable<Page> = this.topicService.getPagination$();
  loading$: Observable<boolean> = this.progressBarService.loading$;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private jsonGrid: JsonGrid,
    private titleService: Title,
    private progressBarService: ProgressBarService,
    private topicService: TopicService,
    private drawerService: DrawerService,
    private servers: ServersService,
    private messageDataService: MessageDataService,
    private router: Router,
    private location: Location
  ) {
    super();
    this.jsonToGridSubscription = this.topicService
    .getConvertTopicMessagesJsonToGridObservable$()
    .subscribe((value) => {
      this.jsonToGrid(value);
    });
  }

  private static tryParseJson(message: string): Record<string, unknown> {
    try {
      const parsedMessage = JSON.parse(message);
      return parsedMessage && typeof parsedMessage === 'object' ? parsedMessage : {};
    } catch (e) {
      return {};
    }
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe((params) => {
      this.topicName = params['topic'];
      this.topicService.getMessages(
        this.servers.getSelectedServerId(),
        this.topicName
      );
      this.titleService.setTitle(this.topicName + ' Kouncil');
      this.paused = true;
    });

    this.route.queryParams.subscribe(params => {
      if (params['page'] !== undefined) {
        this.topicService.paginateMessages(this.servers.getSelectedServerId(), {page: +params['page']}, this.topicName);
      }
    });

    this.searchSubscription = this.searchService
    .getPhraseState$('topic')
    .subscribe((phrase) => {
      this.filterRows(phrase);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.jsonToGridSubscription?.unsubscribe();
    this.paused = true;
  }

  getMessagesDelta(): void {
    if (this.paused) {
      return;
    }
    this.topicService.getMessages(
      this.servers.getSelectedServerId(),
      this.topicName
    );
    setTimeout(() => this.getMessagesDelta(), 1000);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
  getRowClass: (row) => { 'kafka-row-delta': any } = (row) => {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'kafka-row-delta': row['fresh'],
    };
  };

  toggleLiveEventHandler(action: LiveUpdateState): void {
    if (LiveUpdateState.PAUSE === action) {
      this.paused = true;
    } else if (LiveUpdateState.PLAY === action) {
      this.paused = false;
      this.getMessagesDelta();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  showMessage(event: any): void {
    const messageData = {
      value: event.kouncilValueJson && Object.keys(event.kouncilValueJson).length > 0 ?
        event.kouncilValueJson : event.kouncilValue,
      valueFormat: event.kouncilValueFormat,
      headers: event.headers,
      key: event.kouncilKeyJson && Object.keys(event.kouncilKeyJson).length > 0 ?
        event.kouncilKeyJson : event.kouncilKey,
      keyFormat: event.kouncilKeyFormat,
      topicName: this.topicName,
      timestamp: event.kouncilTimestampEpoch,
    } as MessageData;
    this.messageDataService.setMessageData(messageData);
    this.drawerService.openDrawerWithPadding(MessageViewComponent);
  }

  openSendPopup(): void {
    const messageData = {
      topicName: this.topicName,
      headers: []
    } as MessageData;
    this.messageDataService.setMessageData(messageData);
    this.drawerService.openDrawerWithPadding(SendComponent);
  }

  openResendPopup(): void {
    const messageData = {
      topicName: this.topicName,
      headers: []
    } as MessageData;
    this.messageDataService.setMessageData(messageData);
    this.drawerService.openDrawerWithPadding(ResendComponent);
  }

  private jsonToGrid(topicMessages: TopicMessages): void {
    const values: JsonGridData[] = [];
    topicMessages.messages.forEach((message: MessageData) =>
      values.push({
        value: message.value,
        valueFormat: message.valueFormat,
        valueJson: TopicComponent.tryParseJson(message.value),
        partition: message.partition,
        offset: message.offset,
        key: message.key,
        keyFormat: message.keyFormat,
        keyJson: TopicComponent.tryParseJson(message.key),
        timestamp: message.timestamp,
        headers: message.headers,
      } as JsonGridData)
    );
    this.jsonGrid.replaceObjects(values);

    this.commonColumns = [];
    this.commonColumns.push({
      name: 'partition',
      prop: 'kouncilPartition',
      sticky: true,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 100
    });
    this.commonColumns.push({
      name: 'offset',
      prop: 'kouncilOffset',
      sticky: true,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 100,
    });
    this.commonColumns.push({
      name: 'key',
      prop: 'kouncilKey',
      sticky: true,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 150,
    });
    this.commonColumns.push({
      name: 'timestamp',
      prop: 'kouncilTimestamp',
      sticky: true,
      resizeable: true,
      sortable: true,
      draggable: true,
      width: 215,
    });
    this.valueColumns = [
      {
        name: 'value',
        prop: 'kouncilValue',
        sticky: false,
        resizeable: true,
        sortable: true,
        draggable: true,
        width: 200,
      },
    ];
    const gridColumns: TableColumn[] = [];
    Array.from(this.jsonGrid.getColumns().values()).forEach((column) => {
      gridColumns.push({
        name: column.name,
        prop: column.name,
        sticky: false,
        resizeable: true,
        sortable: true,
        draggable: false,
        width: 200
      });
    });

    this.jsonColumns = gridColumns.filter(
      (c: TableColumn) => !c.name?.startsWith('H[')
    );
    this.headerColumns = gridColumns.filter((c: TableColumn) =>
      c.name?.startsWith('H[')
    );

    this.refreshColumns();

    this.allRows = [...this.jsonGrid.getRows()];
    this.filterRows(this.searchService.currentPhrase);
  }

  private filterRows(phrase?: string): void {
    this.filteredRows = this.allRows.filter((row) => {
      return (
        !phrase ||
        JSON.stringify(row).toLowerCase().indexOf(phrase.toLowerCase()) > -1
      );
    });
  }

  toggleHeadersEventHandler(showHeaderColumns: boolean): void {
    this.showHeaderColumns = showHeaderColumns;
    this.refreshColumns();
  }

  toggleJsonEventHandler(showJsonColumns: boolean): void {
    this.showJsonColumns = showJsonColumns;
    this.refreshColumns();
  }

  refreshColumns(): void {
    let columns: TableColumn[] = [...this.commonColumns];
    if (this.showHeaderColumns) {
      columns = columns.concat(this.headerColumns);
    }
    if (this.showJsonColumns) {
      columns = columns.concat(this.jsonColumns);
    } else {
      columns = columns.concat(this.valueColumns);
    }
    this.columns = columns;
  }

  public updateQueryParams(page: number): void {
    const urlTree = this.router.createUrlTree([], {relativeTo: this.route, queryParams: {page}});
    this.location.go(urlTree.toString());
  }
}
