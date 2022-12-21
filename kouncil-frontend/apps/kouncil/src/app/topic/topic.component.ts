import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {DatePipe, Location} from '@angular/common';
import { Title } from '@angular/platform-browser';
import { TopicService, topicServiceProvider } from './topic.service';
import { Page } from './page';
import { ResendComponent } from '@app/resend-events';
import { MessageViewComponent } from './message/message-view.component';
import { LiveUpdateState } from './toolbar/toolbar.component';
import { TableColumn } from '@swimlane/ngx-datatable/lib/types/table-column.type';
import { JsonGridData } from './json-grid-data';
import { CustomTableColumn } from './custom-table-column';
import { Observable, Subscription } from 'rxjs';
import { JsonGrid } from './json-grid';
import { TopicMessages } from './topic-messages';
import {Model} from '@swimlane/ngx-datatable';
import {MessageData, MessageDataService} from '@app/message-data';
import {DrawerService, ProgressBarService, SearchService} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {SendComponent} from '@app/feat-send';

@Component({
  selector: 'app-topic',
  template: `
    <div class="topic">
      <div class="topic-table-area">
        <div class="topic-toolbar-area">
          <app-kafka-toolbar
            [name]="topicName"
            (toggleLiveEvent)="toggleLiveEventHandler($event)"
            (openSendPopupEvent)="openSendPopup()"
            (openResendPopupEvent)="openResendPopup()"
            (toggleHeadersEvent)="toggleHeadersEventHandler($event)"
            (toggleJsonEvent)="toggleJsonEventHandler($event)"
          >
          </app-kafka-toolbar>
        </div>

        <ng-template #noDataPlaceholder>
          <app-no-data-placeholder
            [objectTypeName]="'Message'"
          ></app-no-data-placeholder>
        </ng-template>
        <ngx-datatable
          *ngIf="
            filteredRows && filteredRows.length > 0;
            else noDataPlaceholder
          "
          class="topic-table material expandable"
          [rows]="filteredRows"
          [columns]="columns"
          [rowHeight]="48"
          [headerHeight]="48"
          [footerHeight]="80"
          [scrollbarH]="true"
          [scrollbarV]="true"
          [columnMode]="'force'"
          [rowClass]="getRowClass"
          [loadingIndicator]="loading$ | async"
          (activate)="showMessage($event)"
          #table
        >
          <ngx-datatable-footer>
            <ng-template ngx-datatable-footer-template>
              <app-topic-pagination
                class="topic-pagination"
                [paging]="paging$ | async"
                [topicName]="topicName"
                (changeQueryParams)="updateQueryParams($event)"
              ></app-topic-pagination>
            </ng-template>
          </ngx-datatable-footer>
        </ngx-datatable>
      </div>

      <ng-template #headerTemplate let-column="column" let-sort="sortFn">
        <span
          class="datatable-header-cell-wrapper datatable-header-cell-label"
          title="{{ column.name }}"
          (click)="sort()"
          >{{ column.nameShort }}</span
        >
      </ng-template>
    </div>
  `,
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe, topicServiceProvider],
})
export class TopicComponent implements OnInit, OnDestroy {
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

  @ViewChild('headerTemplate', { static: true })
  headerTemplate?: TemplateRef<unknown>;

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
    this.jsonToGridSubscription = this.topicService
      .getConvertTopicMessagesJsonToGridObservable$()
      .subscribe((value) => {
        this.jsonToGrid(value);
      });
  }

  private static tryParseJson(message: string): Record<string, unknown> {
    try {
      const parsedMessage = JSON.parse(message);
      return parsedMessage && typeof parsedMessage === 'object' ? parsedMessage: {};
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
      if(params['page']!==undefined){
        this.topicService.paginateMessages(this.servers.getSelectedServerId(), {page: params['page']}, this.topicName);
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

  showMessage(event: Model): void {
    if (event.type === 'click') {
      const messageData = {
        value: event.row.kouncilValueJson && Object.keys(event.row.kouncilValueJson).length > 0 ?
          event.row.kouncilValueJson : event.row.kouncilValue,
        valueFormat: event.row.kouncilValueFormat,
        headers: event.row.headers,
        key: event.row.kouncilKeyJson && Object.keys(event.row.kouncilKeyJson).length > 0 ?
          event.row.kouncilKeyJson : event.row.kouncilKey,
        keyFormat: event.row.kouncilKeyFormat,
        topicName: this.topicName,
        timestamp: event.row.kouncilTimestampEpoch,
      } as MessageData;
      this.messageDataService.setMessageData(messageData);
      this.drawerService.openDrawerWithPadding(MessageViewComponent);
    }
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
      width: 100,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'partition',
      prop: 'kouncilPartition',
    });
    this.commonColumns.push({
      width: 100,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'offset',
      prop: 'kouncilOffset',
    });
    this.commonColumns.push({
      width: 200,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'key',
      prop: 'kouncilKey',
    });
    this.commonColumns.push({
      width: 180,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'timestamp',
      prop: 'kouncilTimestamp',
    });
    this.valueColumns = [
      {
        width: 200,
        resizeable: true,
        sortable: true,
        draggable: true,
        canAutoResize: true,
        name: 'value',
        prop: 'kouncilValue',
      },
    ];
    const gridColumns: CustomTableColumn[] = [];
    Array.from(this.jsonGrid.getColumns().values()).forEach((column) => {
      gridColumns.push({
        canAutoResize: true,
        prop: column.name,
        name: column.name,
        nameShort: column.nameShort,
        headerTemplate: this.headerTemplate,
      });
    });

    this.jsonColumns = gridColumns.filter(
      (c: CustomTableColumn) => !c.name?.startsWith('H[')
    );
    this.headerColumns = gridColumns.filter((c: CustomTableColumn) =>
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
