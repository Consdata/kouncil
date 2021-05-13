import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProgressBarService} from './progress-bar.service';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-progress-bar',
  template: `<div *ngIf="progress" class="kafka-progress"></div>`
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  progress: boolean;

  constructor(private progressBarService: ProgressBarService) {
  }

  ngOnInit(): void {
    this.listenToProgress();
  }

  ngOnDestroy(): void {
    this.progressBarService.progressSub.unsubscribe();
  }

  private listenToProgress() {
    this.progressBarService.progressSub
      .pipe(delay(0))
      .subscribe((progress) => {
        this.progress = progress;
      });
  }
}
