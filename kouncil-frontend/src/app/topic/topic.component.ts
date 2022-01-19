import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TopicMessages} from 'app/topic/topic-messages';
import {SearchService} from 'app/search.service';
import {Observable, Subscription} from 'rxjs';
import {JsonGrid} from 'app/topic/json-grid';
import {DatePipe} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {ProgressBarService} from '../util/progress-bar.service';
import {TopicService, topicServiceProvider} from './topic.service';
import {Page} from './page';
import {SendComponent} from '../send/send.component';
import {MessageViewComponent} from './message/message-view.component';
import {DrawerService} from '../util/drawer.service';
import {ServersService} from '../servers.service';
import {LiveUpdateState} from './toolbar/toolbar.component';
import {TableColumn} from '@swimlane/ngx-datatable/lib/types/table-column.type';
import {Message} from './message';
import {JsonGridData} from './json-grid-data';
import {CustomTableColumn} from './custom-table-column';

@Component({
  selector: 'app-topic',
  template: `
    <div class="topic">
      <div class="topic-table-area">
        <div class="topic-toolbar-area">
          <app-kafka-toolbar [name]="topicName"
                             (toggleLiveEvent)="toggleLiveEventHandler($event)"
                             (openSendPopupEvent)="openSendPopup()"
                             (toggleHeadersEvent)="toggleHeadersEventHandler($event)"
                             (toggleJsonEvent)="toggleJsonEventHandler($event)">
          </app-kafka-toolbar>
        </div>

        <ng-template #noDataPlaceholder>
          <app-no-data-placeholder [objectTypeName]="'Message'"></app-no-data-placeholder>
        </ng-template>
        <ngx-datatable *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
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
                       #table>

          <ngx-datatable-footer>
            <ng-template ngx-datatable-footer-template>
              <app-topic-pagination class="topic-pagination" [paging]="paging$ | async"
                                    [topicName]="topicName"></app-topic-pagination>
            </ng-template>
          </ngx-datatable-footer>
        </ngx-datatable>
      </div>

      <ng-template #headerTemplate let-column="column" let-sort="sortFn">
    <span class="datatable-header-cell-wrapper datatable-header-cell-label" title="{{column.name}}"
          (click)="sort()">{{column.nameShort}}</span>
      </ng-template>

    </div>
  `,
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe, topicServiceProvider]
})
export class TopicComponent implements OnInit, OnDestroy {

  topicName: string;
  columns: TableColumn[] = [];
  commonColumns: TableColumn[] = [];
  headerColumns: TableColumn[] = [];
  jsonColumns: TableColumn[] = [];
  valueColumns: TableColumn[] = [];
  showHeaderColumns: boolean = true;
  showJsonColumns: boolean = true;
  allRows: unknown[] = [];
  filteredRows: unknown[] = [];

  searchSubscription: Subscription;

  paused: boolean;

  jsonToGridSubscription: Subscription;
  paging$: Observable<Page>;
  loading$: Observable<boolean> = this.progressBarService.loading$;

  @ViewChild('table') table: any;
  @ViewChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<unknown>;

  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private jsonGrid: JsonGrid,
              private titleService: Title,
              private progressBarService: ProgressBarService,
              private topicService: TopicService,
              private drawerService: DrawerService,
              private servers: ServersService) {
    this.jsonToGridSubscription = this.topicService.getConvertTopicMessagesJsonToGridObservable().subscribe(value => {
      this.jsonToGrid(value);
    });
    this.paging$ = this.topicService.getPagination$();
  }

  private static tryParseJson(message): Object {
    try {
      return JSON.parse(message);
    } catch (e) {
      return {};
    }
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
      this.topicService.getMessages(this.servers.getSelectedServerId(), this.topicName);
      this.titleService.setTitle(this.topicName + ' Kouncil');
      this.paused = true;
    });

    this.searchSubscription = this.searchService.getPhraseState('topic').subscribe(
      phrase => {
        this.filterRows(phrase);
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.jsonToGridSubscription.unsubscribe();
    this.paused = true;
  }

  getMessagesDelta(): void {
    if (this.paused) {
      return;
    }
    this.topicService.getMessages(this.servers.getSelectedServerId(), this.topicName);
    setTimeout(() => this.getMessagesDelta(), 1000);
  }

  getRowClass: (row) => { 'kafka-row-delta': any } = (row) => {
    return {
      'kafka-row-delta': row['fresh']
    };
  }

  toggleLiveEventHandler(action: LiveUpdateState): void {
    if (LiveUpdateState.PAUSE === action) {
      this.paused = true;
    } else if (LiveUpdateState.PLAY === action) {
      this.paused = false;
      this.getMessagesDelta();
    }
  }

  showMessage(event): void {
    if (event.type === 'click') {
      this.drawerService.openDrawerWithPadding(MessageViewComponent, {
        source: event.row.kouncilValueJson || event.row.kouncilValue,
        headers: event.row.headers,
        key: event.row.kouncilKey,
        topicName: this.topicName,
        timestamp: event.row.kouncilTimestampEpoch
      });
    }
  }

  openSendPopup(): void {
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: this.topicName,
      headers: []
    });
  }

  private jsonToGrid(topicMessages: TopicMessages): void {
    const values: JsonGridData[] = [];
    topicMessages.messages.forEach((message: Message) => values.push({
      value: message.value,
      valueJson: TopicComponent.tryParseJson(message.value),
      partition: message.partition,
      offset: message.offset,
      key: message.key,
      timestamp: message.timestamp,
      headers: message.headers
    }));
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
      prop: 'kouncilPartition'
    });
    this.commonColumns.push({
      width: 100,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'offset',
      prop: 'kouncilOffset'
    });
    this.commonColumns.push({
      width: 200,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'key',
      prop: 'kouncilKey'
    });
    this.commonColumns.push({
      width: 180,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      frozenLeft: true,
      name: 'timestamp',
      prop: 'kouncilTimestamp'
    });
    this.valueColumns = [{
      width: 200,
      resizeable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'value',
      prop: 'kouncilValue'
    }];
    const gridColumns: CustomTableColumn[] = [];
    Array.from(this.jsonGrid.getColumns().values()).forEach(column => {
        gridColumns.push({
          canAutoResize: true,
          prop: column.name,
          name: column.name,
          nameShort: column.nameShort,
          headerTemplate: this.headerTemplate
        });
      }
    );

    this.jsonColumns = gridColumns.filter((c: CustomTableColumn) =>
      !c.name?.startsWith('H[')
    );
    this.headerColumns = gridColumns.filter((c: CustomTableColumn) =>
      c.name?.startsWith('H[')
    );

    this.refreshColumns();

    this.allRows = [...this.jsonGrid.getRows()];
    this.filterRows(this.searchService.currentPhrase);
  }

  private filterRows(phrase: string): void {
    this.filteredRows = this.allRows.filter((row) => {
      return !phrase || JSON.stringify(row).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
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

}
