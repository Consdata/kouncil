import {Component, OnInit, ViewChild} from '@angular/core';
import {TrackService} from '../track.service';
import {FormControl, NgForm} from '@angular/forms';
import {TrackFilter, TrackOperator} from './track-filter';
import {TopicsService} from '@app/feat-topics';
import {Topics} from '@app/common-model';
import {ServersService} from '@app/common-servers';
import {SelectableItem} from '@app/common-components';

@Component({
  selector: 'app-track-filter',
  template: `
    <form #filtersForm="ngForm">

      <div class="wrapper">
        <mat-form-field class="filter-input right-padding correlation-field"
                        [appearance]="'outline'">
          <input class="wrapper-field"
                 placeholder="Correlation field"
                 matInput
                 type="text"
                 name="field"
                 [(ngModel)]="trackFilter.field"
          />
        </mat-form-field>
        <mat-form-field class="filter-input wrapper-select right-padding correlation-field"
                        [appearance]="'outline'">
          <mat-select name="operator" [(ngModel)]="trackFilter.operator" class="transparent-select">
            <mat-option *ngFor="let operator of operators"
                        [value]="operator.index">
              {{ operator.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="filter-input correlation-field" [appearance]="'outline'">
          <input class="wrapper-field"
                 placeholder="Correlation value"
                 matInput
                 type="text"
                 name="value"
                 [(ngModel)]="trackFilter.value"
          />
        </mat-form-field>
      </div>

      <div class="field-with-label">
        <app-common-autocomplete [control]="topicFilterControl"
                                 [data]="topicList"
                                 [placeholder]="'Topics'"
                                 [emptyFilteredMsg]="'No topics found'"
                                 [panelWidth]="'auto'"
                                 (selectedValueEvent)="updateTopics($event)"></app-common-autocomplete>
      </div>

      <div class="form-control">
        <div class="wrapper" ngDefaultControl [formControl]="datesControl">
          <span class="wrapper-glue-start">Track from</span>
          <mat-form-field class="filter-input date-picker-form-field test" [appearance]="'outline'">
            <input class="wrapper-field"
                   matInput
                   type="datetime-local"
                   name="startDateTime"
                   [(ngModel)]="trackFilter.startDateTime"
            />
          </mat-form-field>
          <span class="wrapper-glue">to</span>
          <mat-form-field class="filter-input date-picker-form-field" [appearance]="'outline'">
            <input class="wrapper-field"
                   matInput
                   type="datetime-local"
                   name="stopDateTime"
                   [(ngModel)]="trackFilter.stopDateTime"
            />
          </mat-form-field>
        </div>
        <div class="validation-error" *ngIf="datesControl.invalid">
          {{ datesControl.errors['validation'].message }}
        </div>
      </div>

      <button mat-button
              disableRipple
              class="clear-button"
              type="button"
              (click)="clearFilter()">
        Clear
      </button>

      <button mat-button
              disableRipple
              class="filter-button"
              [class.spinner]="loading"
              [disabled]="loading"
              (click)="setFilter()">
        Track events
      </button>
    </form>

    <mat-slide-toggle [class.active]="asyncModeState === true"
                      disableRipple
                      class="switch"
                      (change)="toggleAsyncMode()"
                      [(ngModel)]="asyncModeState"
                      [matTooltip]="toolTip">
      async
    </mat-slide-toggle>
  `,
  styleUrls: ['./track-filter.component.scss'],
})
export class TrackFilterComponent implements OnInit {
  @ViewChild('filtersForm', {static: false}) filtersForm?: NgForm;

  operators: { name: string; index: number }[] = Object.keys(TrackOperator)
  .filter((e) => !isNaN(+e))
  .map((o) => ({
    index: +o,
    name: TrackOperator[o],
  }));

  topicList: SelectableItem[] = [];
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
      this.topicList = topics.topics.map((tm) => new SelectableItem(tm.name, tm.name, false));
      this.visibleTopicList = topics.topics.map((tm) => tm.name);
    });
    this.trackFilter = this.trackService.getStoredTrackFilter();

    this.trackService.trackFinished.subscribe(() => {
      this.loading = false;
    });
  }

  toggleAsyncMode(): void {
    this.trackService.toggleAsyncMode();
  }

  clearFilter(): void {
    this.trackFilter = this.trackService.defaultFilter();
    this.topicFilterControl.setValue([]);
    this.topicList.forEach(topic => topic.selected = false);
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

  updateTopics($event: Array<string>): void {
    this.trackFilter.topics = $event;
  }
}
