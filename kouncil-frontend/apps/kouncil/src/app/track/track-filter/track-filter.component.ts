import {Component, OnInit, ViewChild} from '@angular/core';
import {TrackService} from '../track.service';
import {FormControl, NgForm} from '@angular/forms';
import {ServersService} from '../../servers.service';
import {TrackFilter, TrackOperator} from './track-filter';
import {TopicsService} from '@app/feat-topics';
import {Topics} from '@app/common-model';

@Component({
  selector: 'app-track-filter',
  template: `
    <form #filtersForm="ngForm">
      <div class="wrapper">
        <input
          class="filter-input wrapper-field"
          placeholder="Correlation field"
          matInput
          type="text"
          name="field"
          [(ngModel)]="trackFilter.field"
        />
        <mat-form-field class="filter-input wrapper-select" floatLabel="never">
          <mat-select name="operator" [(ngModel)]="trackFilter.operator">
            <mat-option
              *ngFor="let operator of operators"
              [value]="operator.index"
            >
              {{ operator.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <input
          class="filter-input wrapper-field"
          placeholder="Correlation value"
          matInput
          type="text"
          name="value"
          [(ngModel)]="trackFilter.value"
        />
      </div>
      <div>
        <mat-form-field class="filter-input" floatLabel="never">
          <mat-select
            id="topics-select"
            placeholder="Topics"
            name="topics"
            [(ngModel)]="trackFilter.topics"
            multiple
            disableRipple
          >
            <mat-option>
              <ngx-mat-select-search
                [showToggleAllCheckbox]="true"
                [toggleAllCheckboxChecked]="
                  trackFilter.topics.length === visibleTopicList.length
                "
                (toggleAll)="toggleAllTopics()"
                [formControl]="topicFilterControl"
                placeholderLabel="Search topics"
                noEntriesFoundLabel="No topics found"
              >
              </ngx-mat-select-search>
            </mat-option>
            <mat-option
              *ngFor="let topic of visibleTopicList"
              [value]="topic"
              >{{ topic }}</mat-option
            >
          </mat-select>
        </mat-form-field>
      </div>
      <div class="form-control">
        <div class="wrapper" ngDefaultControl [formControl]="datesControl">
          <span class="wrapper-glue-start">Track from</span>
          <mat-form-field
            class="filter-input date-picker-form-field"
            floatLabel="never"
          >
            <input
              class="wrapper-field"
              matInput
              type="datetime-local"
              placeholder="Start date"
              name="startDateTime"
              [(ngModel)]="trackFilter.startDateTime"
            />
          </mat-form-field>
          <span class="wrapper-glue">to</span>
          <mat-form-field
            class="filter-input date-picker-form-field"
            floatLabel="never"
          >
            <input
              class="wrapper-field"
              matInput
              type="datetime-local"
              placeholder="End date"
              name="stopDateTime"
              [(ngModel)]="trackFilter.stopDateTime"
            />
          </mat-form-field>
        </div>
        <div class="validation-error" *ngIf="datesControl.invalid">
          {{ datesControl.errors['validation'].message }}
        </div>
      </div>
      <button
        mat-button
        disableRipple
        class="clear-button"
        type="button"
        (click)="clearFilter()"
      >
        Clear
      </button>
      <button
        mat-button
        disableRipple
        class="filter-button"
        [class.spinner]="loading"
        [disabled]="loading"
        (click)="setFilter()"
      >
        Track events
      </button>
    </form>
    <mat-slide-toggle
      [class.active]="asyncModeState === true"
      disableRipple
      class="switch"
      (change)="toggleAsyncMode()"
      [(ngModel)]="asyncModeState"
      [matTooltip]="toolTip"
    >
      async
    </mat-slide-toggle>
  `,
  styleUrls: ['./track-filter.component.scss'],
})
export class TrackFilterComponent implements OnInit {
  @ViewChild('filtersForm', { static: false }) filtersForm?: NgForm;

  operators: { name: string; index: number }[] = Object.keys(TrackOperator)
    .filter((e) => !isNaN(+e))
    .map((o) => ({
      index: +o,
      name: TrackOperator[o],
    }));

  topicList: string[] = [];
  visibleTopicList: string[] = [];
  topicFilterControl: FormControl = new FormControl();
  datesControl: FormControl = new FormControl();
  loading: boolean = false;
  trackFilter: TrackFilter;
  asyncModeState: boolean = this.trackService.isAsyncEnable();
  toolTip: string = 'By default, Kouncil uses Web Sockets and sends events to the browser in small chunks. ' +
    'If this does not work for you,' +
    ' turn it off, but then you have to wait for for the whole search to complete.';

  constructor(
    private trackService: TrackService,
    private topicsService: TopicsService,
    private servers: ServersService
  ) {
    this.trackFilter = this.trackService.getStoredTrackFilter();
  }

  ngOnInit(): void {
    this.topicsService
      .getTopics$(this.servers.getSelectedServerId())
      .subscribe((topics: Topics) => {
        this.topicList = topics.topics.map((tm) => tm.name);
        this.visibleTopicList = topics.topics.map((tm) => tm.name);
      });
    this.trackFilter = this.trackService.getStoredTrackFilter();
    this.topicFilterControl.valueChanges
      .pipe()
      .subscribe(() => this.filterTopics());
    this.trackService.trackFinished.subscribe(() => {
      this.loading = false;
    });
  }

  toggleAsyncMode(): void {
    this.trackService.toggleAsyncMode();
  }

  filterTopics(): void {
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
    this.visibleTopicList = this.topicList.filter((topic) => {
      return terms.every((term) => topic.toLowerCase().indexOf(term) > -1);
    });
  }

  toggleAllTopics(): void {
    if (this.trackFilter) {
      if (this.trackFilter.topics.length === this.visibleTopicList.length) {
        this.trackFilter.topics = [];
      } else {
        this.trackFilter.topics = this.visibleTopicList;
      }
    }
  }

  clearFilter(): void {
    this.trackFilter = this.trackService.defaultFilter();
  }

  setFilter(): void {
    if (this.validate()) {
      this.loading = true;
      if (this.trackFilter) {
        this.trackService.setTrackFilter(this.trackFilter);
      }
    }
  }

  validate(): boolean {
    if (this.trackFilter) {
      if (this.trackFilter.stopDateTime < this.trackFilter.startDateTime) {
        this.datesControl.setErrors({
          validation: {
            message: 'Invalid date range',
          },
        });
        return false;
      }
    }

    this.datesControl.setErrors(null);
    return true;
  }
}
