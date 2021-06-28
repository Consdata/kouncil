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
import {Servers} from '../servers.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe, topicServiceProvider]
})
export class TopicComponent implements OnInit, OnDestroy {

  topicName: string;
  columns = [];
  allRows = [];
  filteredRows = [];
  searchSubscription: Subscription;
  paused: boolean;

  phrase: string;

  jsonToGridSubscription: Subscription;
  paging$: Observable<Page>;

  @ViewChild('table') table: any;
  @ViewChild('expandColumnTemplate', {static: true}) expandColumnTemplate: any;
  @ViewChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<any>;

  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private jsonGrid: JsonGrid,
              private titleService: Title,
              private progressBarService: ProgressBarService,
              private topicService: TopicService,
              private drawerService: DrawerService,
              private servers: Servers) {
    this.jsonToGridSubscription = this.topicService.getConvertTopicMessagesJsonToGridObservable().subscribe(value => {
      this.jsonToGrid(value);
    });
    this.paging$ = this.topicService.getPagination$();
  }

  private static tryParseJson(message) {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  }

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
      this.topicService.getMessages(this.servers.getSelectedServerId(), this.topicName);
      this.titleService.setTitle(this.topicName + ' Kouncil');
      this.paused = true;
    });

    this.searchSubscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.jsonToGridSubscription.unsubscribe();
    this.paused = true;
  }

  getMessagesDelta() {
    if (this.paused) {
      return;
    }
    this.topicService.getMessages(this.servers.getSelectedServerId(), this.topicName);
    setTimeout(() => this.getMessagesDelta(), 1000);
  }

  getRowClass = (row) => {
    return {
      'kafka-row-delta': row['fresh']
    };
  }

  onAction(action: string) {
    console.log('Toolbar action: ' + action);
    if ('pause' === action) {
      this.paused = true;
    } else if ('play' === action) {
      this.paused = false;
      this.getMessagesDelta();
    }
  }

  showMessage(event): void {
    if (event.type === 'click') {
      this.drawerService.openDrawerWithPadding(MessageViewComponent, {
        source: event.row.kouncilValueJson,
        headers: event.row.headers,
        key: event.row.kouncilKey,
        topicName: this.topicName
      });
    }
  }

  openSendPopup() {
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: this.topicName
    });
  }

  private jsonToGrid(topicMessages: TopicMessages) {
    const values = [];
    topicMessages.messages.forEach(message => values.push({
      value: message.value,
      valueJson: TopicComponent.tryParseJson(message.value),
      partition: message.partition,
      offset: message.offset,
      key: message.key,
      timestamp: message.timestamp,
      headers: message.headers
    }));
    this.jsonGrid.replaceObjects(values);

    const columns = [];
    columns.push({
      width: 100,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'partition',
      prop: 'kouncilPartition'
    });
    columns.push({
      width: 100,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'offset',
      prop: 'kouncilOffset'
    });
    columns.push({
      width: 200,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'key',
      prop: 'kouncilKey'
    });
    columns.push({
      width: 180,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'timestamp',
      prop: 'kouncilTimestamp'
    });
    Array.from(this.jsonGrid.getColumns().values()).forEach(column => {
        columns.push({
          canAutoResize: true,
          prop: column.name,
          name: column.name,
          nameShort: column.nameShort,
          headerTemplate: this.headerTemplate
        });
      }
    );

    this.columns = columns;
    this.allRows = [...this.jsonGrid.getRows()];
    this.filterRows();
  }

  private filterRows() {
    this.filteredRows = this.allRows.filter((row) => {
      return !this.phrase || JSON.stringify(row).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  isLoading(): boolean {
    return this.progressBarService.progressSub.getValue();
  }
}
