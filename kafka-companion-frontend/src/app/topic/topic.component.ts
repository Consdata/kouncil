import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {TopicMessages} from "app/topic/topic";
import {SearchService} from "app/search.service";
import {Subscription} from "rxjs";
import {JsonGrid} from "app/topic/json-grid";
import {DatePipe} from "@angular/common";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss'],
  providers: [JsonGrid, DatePipe]
})
export class TopicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private http: HttpClient,
              private searchService: SearchService,
              private jsonGrid: JsonGrid,
              private titleService: Title) {
  }

  partitionOffsets: { [key: number]: number } = {};
  partitionEndOffsets: { [key: number]: number } = {};
  topicName: string;
  columns = [];
  allRows = [];
  filteredRows = [];
  searchSubscription: Subscription;
  paused: boolean;

  phrase: string;

  progress = true;
  partitions: number[];

  selectedPartitions: number[];

  @ViewChild('table') table: any;
  @ViewChild('expandColumnTemplate', {static: true}) expandColumnTemplate: any;
  @ViewChild('headerTemplate', {static: true}) headerTemplate: TemplateRef<any>;

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
    let url;
    if (typeof this.selectedPartitions != 'undefined') {
      let partitionsParam = '';
      for (let i = 0; i < this.selectedPartitions.length; i++) {
        if (this.selectedPartitions[i] === 1) {
          partitionsParam += i + ','
        }
      }
      if(partitionsParam === ''){
        return;
      }
      url = `/api/topic/messages/${this.topicName}/${partitionsParam}/latest`;
    } else {
      url = `/api/topic/messages/${this.topicName}/all/latest`;
    }
    this.http.get(url).subscribe((data: TopicMessages) => {
      this.partitionOffsets = data.partitionOffsets;
      this.partitionEndOffsets = data.partitionEndOffsets;
      this.jsonToGrid(data);
      this.progress = false;
      this.partitions = Array.from({length: Object.values(this.partitionOffsets).length}, (v, i) => i);
      if (typeof this.selectedPartitions === 'undefined') {
        this.selectedPartitions = Array.from({length: Object.values(this.partitionOffsets).length}, () => 1);
      }
    })
  }

  getMessagesDelta() {
    if (this.paused) {
      return;
    }
    this.getMessages();
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

  private static tryParseJson(message) {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  }

  toggleExpandRow(row) {
    this.table.rowDetail.toggleExpandRow(row);
  }

  private filterRows() {
    this.filteredRows = this.allRows.filter((row) => {
      return !this.phrase || JSON.stringify(row).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  formatJson(object) {
    return JSON.stringify(object, null, 2);
  }

  togglePartition(i: any) {
    this.selectedPartitions[i] = -1 * this.selectedPartitions[i];
    this.progress = true;
    this.getMessages();
  }
}
