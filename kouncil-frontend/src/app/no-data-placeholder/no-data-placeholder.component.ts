import {Component, Input, OnInit} from '@angular/core';
import {ProgressBarService} from '../util/progress-bar.service';
import {SearchService} from '../search.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-no-data-placeholder',
  templateUrl: './no-data-placeholder.component.html',
  styleUrls: ['./no-data-placeholder.component.scss']
})
export class NoDataPlaceholderComponent implements OnInit {

  @Input() objectTypeName: string;

  phrase$: Observable<string>;

  constructor(private progressBarService: ProgressBarService,
              private searchService: SearchService) {
    this.phrase$ = searchService.getState();
  }

  ngOnInit(): void {
  }

  isNotLoading(): boolean {
    return !this.progressBarService.progressSub.getValue();
  }
}
