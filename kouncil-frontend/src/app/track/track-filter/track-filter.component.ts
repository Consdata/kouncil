import {Component, OnInit, ViewChild} from '@angular/core';
import {TrackService} from '../track.service';
import {TrackFilter} from './track-filter';
import {FormControl, NgForm} from '@angular/forms';
import {TopicsService} from '../../topics/topics.service';
import {ServersService} from '../../servers.service';

@Component({
  selector: 'app-track-filter',
  template: `
    <form #filtersForm="ngForm">
      <div class="wrapper">
        <input class="filter-input wrapper-field" placeholder="Correlation field" matInput type="text" name="field"
               [(ngModel)]="trackFilter.field"/>
        <span class="wrapper-glue">=</span>
        <input class="filter-input wrapper-field" placeholder="Correlation value" matInput type="text" name="value"
               [(ngModel)]="trackFilter.value"/>
      </div>
      <div>
        <mat-form-field class="filter-input" floatLabel="never">
          <mat-select id="topics-select" placeholder="Topics" name="topics" [(ngModel)]="trackFilter.topics" multiple>
            <mat-option>
              <ngx-mat-select-search [formControl]="topicFilterControl" placeholderLabel="Search topics"></ngx-mat-select-search>
            </mat-option>
            <mat-option *ngFor="let topic of visibleTopicList" [value]="topic">{{topic}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="wrapper">
        <span class="wrapper-glue-start">Track from:</span>
        <mat-form-field class="filter-input" floatLabel="never">
          <input class="wrapper-field" matInput type="datetime-local" placeholder="Start date" name="startDateTime"
                 [(ngModel)]="trackFilter.startDateTime">
        </mat-form-field>
        <span class="wrapper-glue">To:</span>
        <mat-form-field class="filter-input" floatLabel="never">
          <input class="wrapper-field" matInput type="datetime-local" placeholder="End date" name="stopDateTime"
                 [(ngModel)]="trackFilter.stopDateTime">
        </mat-form-field>
      </div>
      <button mat-button disableRipple class="filter-button" (click)="setFilter()">Track events</button>
    </form>
  `,
  styleUrls: ['./track-filter.component.scss']
})
export class TrackFilterComponent implements OnInit {

  @ViewChild('filtersForm', {static: false}) filtersForm: NgForm;

  topicList = [];

  visibleTopicList = [];

  trackFilter;

  topicFilterControl: FormControl = new FormControl();

  constructor(private trackService: TrackService,
              private topicsService: TopicsService,
              private servers: ServersService) {
  }

  ngOnInit(): void {
    this.topicsService.getTopics(this.servers.getSelectedServerId()).subscribe(topics => {
      this.topicList = topics.topics.map(tm => tm.name);
      this.visibleTopicList = topics.topics.map(tm => tm.name);
    });
    const from = new Date();
    from.setMinutes(from.getMinutes() - 5);
    this.trackFilter = new TrackFilter('', '', from.toISOString().slice(0, 16), new Date().toISOString().slice(0, 16), []);

    this.topicFilterControl.valueChanges.pipe().subscribe(() => this.filterTopics());
  }

  filterTopics() {
    if (!this.topicList) {
      return;
    }
    let search = this.topicFilterControl.value;
    if (!search) {
      this.visibleTopicList = this.topicList;
      return;
    } else {
      search = search.toLowerCase();
    }
    const terms = search.split(/\s+/);
    this.visibleTopicList = this.topicList.filter(topic => {
      return terms.every(term => topic.toLowerCase().indexOf(term) > -1);
    });
  }

  setFilter() {
    this.trackService.setTrackFilter(this.trackFilter);
  }
}
