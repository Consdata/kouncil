import {Component, OnInit, ViewChild} from '@angular/core';
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

@Component({
  selector: 'app-track-result',
  template: `<div class="topic">
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
            {{value}}
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
export class TrackResultComponent implements OnInit {

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

  private static tryParseJson(message): string {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.searchSubscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
    this.trackFilterSubscription = this.trackService.trackFilterChange$.subscribe(trackFilter => {
      this.getEvents(trackFilter);
    });
    this.progressBarService.setProgress(false);
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
    this.progressBarService.setProgress(true);
    this.filteredRows = [];
    setTimeout(() => {
      this.trackService.getEvents(this.servers.getSelectedServerId(), trackFilter).subscribe(events => {
        this.allRows = events;
        this.filterRows();
        this.progressBarService.setProgress(false);
      });
    });
  }

}
