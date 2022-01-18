import {Component} from '@angular/core';
import {ProgressBarService} from './progress-bar.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div *ngIf="loading$ | async"
         class="kafka-progress">
    </div>
  `
})
export class ProgressBarComponent {

  loading$: Observable<boolean> = this.progressBarService.loading$;

  constructor(private progressBarService: ProgressBarService) {
  }

}
