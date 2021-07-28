import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProgressBarService} from '../util/progress-bar.service';
import {SearchService} from '../search.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-no-data-placeholder',
  templateUrl: './no-data-placeholder.component.html',
  styleUrls: ['./no-data-placeholder.component.scss']
})
export class NoDataPlaceholderComponent implements OnInit, OnDestroy {

  @Input() objectTypeName: string;

  phrase$: Subscription;

  currentPhrase = '';

  constructor(private progressBarService: ProgressBarService,
              private searchService: SearchService,
              private changeDetectionRef: ChangeDetectorRef) {
    this.currentPhrase = searchService.getCurrentPhrase();
    this.phrase$ = searchService.getState().subscribe(phrase => {
      this.currentPhrase = phrase;
    });
  }

  ngOnInit(): void {
  }

  isNotLoading(): boolean {
    return !this.progressBarService.progressSub.getValue();
  }

  ngOnDestroy(): void {
    this.phrase$.unsubscribe();
  }

  detectChanges(): void {
    this.changeDetectionRef.detectChanges();
  }
}
