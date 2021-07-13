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
import {Crypto} from '../../util/crypto';

@Component({
  selector: 'app-track-result',
  template: `
    <div class="track">
      <ng-template #noDataPlaceholder>
        <app-no-data-placeholder [objectTypeName]="'Message'"></app-no-data-placeholder>
      </ng-template>
      <ngx-datatable *ngIf="filteredRows && filteredRows.length > 0; else noDataPlaceholder"
                     class="track-table material expandable"
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
        <ngx-datatable-column prop="key" name="key" [width]="190">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
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
  stompClient: any;
  asyncHandle: string;

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
    if (this.trackService.isAsyncEnable()) {
      this.initializeWS();
    }
  }

  private initializeWS() {
    console.log('Initialize WebSocket');
    const ws = new SockJS('/ws');
    this.stompClient = Stomp.over(ws);
    this.asyncHandle = Crypto.uuidv4();
    const _this = this;
    this.stompClient.connect({}, function () {
      _this.stompClient.subscribe('/topic/track/' + _this.asyncHandle, function (sdkEvent) {
        _this.onMessageReceived(sdkEvent);
      });
    }, this.errorCallBack);
  }

  errorCallBack(error) {
    console.log('WebSocket errorCallBack -> ' + error);
    setTimeout(() => {
      this.initializeWS();
    }, 5000);
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.trackFilterSubscription.unsubscribe();
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
      console.log('WebSocket disconnected');
    }
  }

  onMessageReceived(message) {
    this.filteredRows = [];
    setTimeout(() => {
      const items = JSON.parse(message.body);
      this.allRows = [...this.allRows, ...items];
      this.filterRows();
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
    this.filteredRows = [];
    this.allRows = [];
    setTimeout(() => {
      this.trackService.getEvents(this.servers.getSelectedServerId(), trackFilter, this.asyncHandle).subscribe(events => {
        if (events !== undefined && events.length > 0) {
          this.allRows = [...this.allRows, ...events];
          this.filterRows();
        }
      });
    });
  }

}
