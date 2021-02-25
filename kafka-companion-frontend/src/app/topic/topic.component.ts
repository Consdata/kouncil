import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TopicMessages} from "app/topic/topic";
import {SearchService} from "app/search.service";
import {Subscription} from "rxjs";
import {JsonGrid} from "app/topic/json-grid";
import {DatePipe} from "@angular/common";
import {Title} from "@angular/platform-browser";
import {ProgressBarService} from "../util/progress-bar.service";
import {TopicService} from './topic.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe, TopicService]
})
export class TopicComponent implements OnInit, OnDestroy {
  topicName: string;
  searchSubscription: Subscription;
  jsonToGridSubscription: Subscription;
  paused: boolean;
  phrase: string;
  columns = [];
  allRows = [];
  filteredRows = [];

  @ViewChild('table') table: any;
  @ViewChild('expandColumnTemplate', {static: true}) expandColumnTemplate: any;
  @ViewChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<any>;

  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private jsonGrid: JsonGrid,
              private titleService: Title,
              private progressBarService: ProgressBarService,
              private topicService: TopicService) {
    this.jsonToGridSubscription = this.topicService.getConvertTopicMessagesJsonToGridObservable().subscribe(value => {
      this.jsonToGrid(value);
    })
  }

  ngOnInit() {
    this.progressBarService.setProgress(true);
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
      this.topicService.getMessages(this.topicName);
      this.titleService.setTitle(this.topicName + " KafkaCompanion");
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
    this.topicService.getMessages(this.topicName);
    setTimeout(() => this.getMessagesDelta(), 1000);
  }

  getRowClass = (row) => {
    return {
      'kafka-row-delta': row['fresh']
    }
  };

  onAction(action: string) {
    console.log("Toolbar action: " + action);
    if ('pause' === action) {
      this.paused = true;
    } else if ('play' === action) {
      this.paused = false;
      this.getMessagesDelta();
    }
  }

  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }


  private jsonToGrid(topicMessages: TopicMessages) {
    let values = [];
    topicMessages.messages.forEach(message => values.push({
      value: message.value,
      valueJson: TopicComponent.tryParseJson(message.value),
      partition: message.partition,
      offset: message.offset,
      key: message.key,
      timestamp: message.timestamp
    }));
    this.jsonGrid.replaceObjects(values);

    let columns = [];
    columns.push({
      width: 20,
      resizable: false,
      sortable: false,
      draggable: false,
      canAutoResize: false,
      cellTemplate: this.expandColumnTemplate
    });
    columns.push({
      width: 100,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'partition',
      prop: 'kafkaCompanionPartition'
    });
    columns.push({
      width: 100,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'offset',
      prop: 'kafkaCompanionOffset'
    });
    columns.push({
      width: 200,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'key',
      prop: 'kafkaCompanionKey'
    });
    columns.push({
      width: 180,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'timestamp',
      prop: 'kafkaCompanionTimestamp'
    });
    Array.from(this.jsonGrid.getColumns().values()).forEach(column => {
        columns.push({
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

  formatJson(object) {
    return JSON.stringify(object, null, 2);
  }

  private static tryParseJson(message) {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  }

}
