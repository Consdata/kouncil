import {Component, OnInit, ViewChild} from '@angular/core';
import {TrackService} from '../track.service';
import {TrackFilter} from './track-filter';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-track-filter',
  template: `
    <form #filtersForm="ngForm">
      <div class="filter-title">Specify search criteria:</div>
      <div>
        <input class="filter-input" placeholder="Correlation field" matInput type="text" name="field"
               [(ngModel)]="trackFilter.field"/>
      </div>
      <div>
        <input class="filter-input" placeholder="Correlation value" matInput type="text" name="value"
               [(ngModel)]="trackFilter.value"/>
      </div>
      <div>
        <mat-form-field class="filter-input">
          <mat-select placeholder="Topics"  name="topics" [(ngModel)]="trackFilter.topics" multiple>
            <mat-option *ngFor="let topic of topicList" [value]="topic">{{topic}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div>
        <mat-form-field class="filter-input">
          <input matInput type="datetime-local" placeholder="Start date" name="startDateTime"
                 [(ngModel)]="trackFilter.startDateTime">
        </mat-form-field>
        <mat-form-field class="filter-input">
          <input matInput type="datetime-local" placeholder="End date" name="stopDateTime"
                 [(ngModel)]="trackFilter.stopDateTime">
        </mat-form-field>

        <button mat-button disableRipple class="filter-button" (click)="setFilter()">Track event</button>
      </div>
    </form>
  `,
  styleUrls: ['./track-filter.component.scss']
})
export class TrackFilterComponent implements OnInit {
  @ViewChild('filtersForm', {static: false}) filtersForm: NgForm;
  topicList = ['test1', 'test2', 'test3'];
  trackFilter;

  constructor(private trackService: TrackService) {
  }

  ngOnInit(): void {
    const from = new Date();
    from.setMinutes(from.getMinutes() - 5);
    this.trackFilter = new TrackFilter('', '', from.toISOString().slice(0, 16), new Date().toISOString().slice(0, 16), []);
  }

  setFilter() {
    this.trackService.setTrackFilter(this.trackFilter);
  }
}
