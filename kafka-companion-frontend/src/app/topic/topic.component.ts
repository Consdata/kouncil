import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { TopicMessages } from "app/topic/topic";
import { SearchService } from "app/search.service";
import { Subscription } from "rxjs/Subscription";
import { JsonGrid } from "app/topic/json-grid";
import { DatePipe } from "@angular/common";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe]
})
export class TopicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private http: HttpClient, private searchService: SearchService, private jsonGrid: JsonGrid, private titleService: Title) {
  }

  partitionOffsets: {[key: number]: number} = {};
  topicName: string;
  columns = [];
  allRows = [];
  filteredRows = [];
  searchSubscription: Subscription;
  paused: boolean;

  groupId = 'kafka-companion-' + Math.floor(Math.random() * 1000000000);
  phrase: string;
  progress = true;

  @ViewChild('table') table: any;
  @ViewChild('expandColumnTemplate') expandColumnTemplate: any;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
      this.getMessages();
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
    this.paused = true;
  }


  getMessages() {
    this.http.get(`/api/topic/messages/${this.topicName}/${this.groupId}/10000`).subscribe((data) => {
      this.partitionOffsets = ((<TopicMessages>data).partitionOffsets);
      this.jsonToGrid(<TopicMessages>data);
      this.progress = false;
      this.getMessagesDelta()
    })
  }

  getMessagesDelta() {
    if (this.paused) {
      return;
    }
    this.http.get(`/api/topic/delta/${this.topicName}/${this.groupId}/10000`).subscribe((data) => {
      let topicMessages = <TopicMessages>data;
      if (topicMessages.messages.length > 0) {
        this.jsonToGrid(<TopicMessages>data);
      }
      this.getMessagesDelta()
    })
  }

  getRowClass = (row) => {
    return {
      'kafka-row-delta': row['fresh']
    }
  };

  onAction(action: string) {
    console.log("Toolbar action: " + action);
    if('pause' === action) {
      this.paused = true;
    } else if('play' === action) {
      this.paused = false;
      this.getMessagesDelta();
    }
  }

  private jsonToGrid(topicMessages: TopicMessages) {
    let values = [];
    topicMessages.messages.forEach(message => values.push({
      value: message.value,
      valueJson: this.tryParseJson(message.value),
      partition: message.partition,
      offset: message.offset,
      key: message.key,
      timestamp: message.timestamp
    }));
    this.jsonGrid.addObjects(values);

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
      width: 40,
      resizable: true,
      sortable: true,
      draggable: true,
      canAutoResize: true,
      name: 'part',
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
        columns.push({prop: column.name, name: column.name, nameShort: column.nameShort, headerTemplate: this.headerTemplate});
      }
    );

    this.columns = columns;
    this.allRows = [...this.jsonGrid.getRows()];
    this.filterRows();
  }

  private getTotal() {
    let total = 0;
    Object.values(this.partitionOffsets).forEach(partitionOffset => total += <number> partitionOffset);
    return total;
  }

  private getPartitionsCount() {
    return Object.values(this.partitionOffsets).length;
  }

  private tryParseJson(message) {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  }

  private toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  private filterRows() {
    this.filteredRows = this.allRows.filter((row) => {
      return !this.phrase || JSON.stringify(row).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  private formatJson(object) {
    return JSON.stringify(object, null, 4);
  }
}
