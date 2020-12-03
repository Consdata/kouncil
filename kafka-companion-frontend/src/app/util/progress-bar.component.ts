import {Component, OnDestroy, OnInit} from "@angular/core";
import {ProgressBarService} from "./progress-bar.service";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-progress-bar',
  template: `<div *ngIf="progress" class="kafka-progress"></div>`,
  styles: [`
    .kafka-progress {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 1;
      border: 16px solid #f3f3f3;
      border-top: 16px solid #3498db;
      border-radius: 50%;
      width: 120px;
      height: 120px;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
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
      })
  }
}
