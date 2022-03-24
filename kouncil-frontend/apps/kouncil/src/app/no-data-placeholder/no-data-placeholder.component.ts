import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { ProgressBarService } from '../util/progress-bar.service';
import { SearchService } from '../search.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-no-data-placeholder',
  template: `
    <div *ngIf="(loading$ | async) === false" class="no-data-wrapper">
      <mat-icon>search_off</mat-icon>
      <div class="no-data-label">No data to display</div>
      <div class="no-data-comment" *ngIf="currentPhrase">
        {{ objectTypeName }} "{{ currentPhrase }}" not found
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./no-data-placeholder.component.scss'],
})
export class NoDataPlaceholderComponent {
  loading$: Observable<boolean> = this.progressBarService.loading$;

  @Input() objectTypeName: string;

  currentPhrase?: string = '';

  constructor(
    private progressBarService: ProgressBarService,
    private searchService: SearchService,
    private changeDetectionRef: ChangeDetectorRef
  ) {
    this.currentPhrase = searchService.currentPhrase;
  }

  detectChanges(): void {
    this.changeDetectionRef.detectChanges();
  }
}
