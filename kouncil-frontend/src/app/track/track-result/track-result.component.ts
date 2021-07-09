import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SearchService} from '../../search.service';
import {Title} from '@angular/platform-browser';
import {ProgressBarService} from '../../util/progress-bar.service';
import {DrawerService} from '../../util/drawer.service';
import {ServersService} from '../../servers.service';
import {MessageViewComponent} from '../../topic/message/message-view.component';
import {TrackService} from '../track.service';
import {TrackFilter} from '../track-filter/track-filter';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-track-result',
  template: `
    <div class="topic">
      <div class="topic-table-area">
        <ng-template #noDataPlaceholder>
          <app-no-data-placeholder [objectTypeName]="'Message'"></app-no-data-placeholder>
        </ng-template>
        <ngx-datatable *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
                       class="topic-table material expandable"
                       [rows]="filteredRows"
                       [rowHeight]="48"
                       [headerHeight]="48"
                       [footerHeight]="80"
                       [scrollbarH]="true"
                       [scrollbarV]="true"
                       [columnMode]="'force'"
                       [loadingIndicator]="isLoading()"
                       (activate)="showMessage($event)"
                       #table>
          <ngx-datatable-column prop="timestamp" name="timestamp" [width]="190">
            <ng-template let-value="value" ngx-datatable-cell-template>
              {{value | date:'yyyy-MM-dd HH:mm:ss.SSS'}}
            </ng-template>
          </ngx-datatable-column>
          <ngx-datatable-column prop="topic" name="topic" [width]="190">
            <ng-template let-value="value" ngx-datatable-cell-template>
              {{value}}
            </ng-template>
          </ngx-datatable-column>
          <ngx-datatable-column prop="partition" name="partition" [width]="190">
            <ng-template let-value="value" ngx-datatable-cell-template>
              {{value}}
            </ng-template>
          </ngx-datatable-column>
          <ngx-datatable-column prop="offset" name="offset" [width]="190">
            <ng-template let-value="value" ngx-datatable-cell-template>
              {{value}}
            </ng-template>
          </ngx-datatable-column>
          <ngx-datatable-column prop="key" name="Key" [width]="190">
            <ng-template let-value="value" ngx-datatable-cell-template>
              {{value}}
            </ng-template>
          </ngx-datatable-column>
        </ngx-datatable>
      </div>
    </div>
  `,
  styleUrls: ['./track-result.component.scss']
})
export class TrackResultComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private titleService: Title,
              private progressBarService: ProgressBarService,
              private trackService: TrackService,
              private drawerService: DrawerService,
              private servers: ServersService) {
  }

  filteredRows = [];
  allRows = [];
  searchSubscription: Subscription;
  trackFilterSubscription: Subscription;
  @ViewChild('table') table: any;
  phrase: string;

  webSocketEndPoint = 'http://localhost:8080/ws';
  topic = '/topic/track';
  stompClient: any;

  private static tryParseJson(message): string {
    try {
      return JSON.parse(message);
    } catch (e) {
      return message;
    }
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
    this.trackFilterSubscription = this.trackService.trackFilterChange$.subscribe(trackFilter => {
      this.getEvents(trackFilter);
    });
    this.websocket();
  }

  private websocket() {
    console.log('Initialize WebSocket Connection');
    const ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    this.stompClient.connect({}, function (frame) {
      _this.stompClient.subscribe(_this.topic, function (sdkEvent) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.trackFilterSubscription.unsubscribe();
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
      console.log('WebSocket disconnected');
    }
  }

  errorCallBack(error) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this.websocket();
    }, 5000);
  }

  onMessageReceived(message) {
    console.log('Message from Server :: ', message);
    this.progressBarService.setProgress(true);
    this.filteredRows = [];
    setTimeout(() => {
      const items = JSON.parse(message.body);
      console.log(items);
      this.allRows = [...this.allRows, ...items];
      console.log('all', this.allRows);
      this.filterRows();
      this.progressBarService.setProgress(false);
    });
  }

  showMessage(event): void {
    if (event.type === 'click') {
      this.drawerService.openDrawerWithPadding(MessageViewComponent, {
        source: TrackResultComponent.tryParseJson(event.row.value),
        headers: event.row.headers,
        key: event.row.key,
        topicName: event.row.topic
      });
    }
  }

  private filterRows() {
    this.filteredRows = this.allRows.filter((row) => {
      return !this.phrase || JSON.stringify(row).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  isLoading(): boolean {
    return this.progressBarService.progressSub.getValue();
  }

  private getEvents(trackFilter: TrackFilter) {
    //this.progressBarService.setProgress(true);
    this.filteredRows = [];
    setTimeout(() => {
      this.trackService.getEvents(this.servers.getSelectedServerId(), trackFilter).subscribe(events => {
        console.log("get events ", events);
        //this.allRows = events;
        //this.filterRows();
        //this.progressBarService.setProgress(false);
      });
    });
  }

}
