import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TrackService} from '../track.service';

@Component({
  selector: 'app-track-filter',
  templateUrl: './track-filter.component.html',
  styleUrls: ['./track-filter.component.scss']
})
export class TrackFilterComponent implements OnInit {
  formControl = new FormControl();
  selectedValue = [];
  topicList = [];

  onOut() {
    console.log('Value after losing focus  is', this.selectedValue);
  }

  constructor(private trackService: TrackService) {
  }

  ngOnInit(): void {
    this.topicList = this.trackService.getSearchableTopics();
  }

}
