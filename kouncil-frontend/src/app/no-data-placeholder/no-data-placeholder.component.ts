import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {ProgressBarService} from '../util/progress-bar.service';
import {SearchService} from '../search.service';

@Component({
  selector: 'app-no-data-placeholder',
  template: `
    <div *ngIf="isNotLoading()" class="no-data-wrapper">
      <mat-icon>search_off</mat-icon>
      <div class="no-data-label">No data to display</div>
      <div class="no-data-comment" *ngIf="currentPhrase">{{objectTypeName}} "{{currentPhrase}}" not found</div>
    </div>
  `,
  styleUrls: ['./no-data-placeholder.component.scss']
})
export class NoDataPlaceholderComponent {

  @Input() objectTypeName: string;

  currentPhrase = '';

  constructor(private progressBarService: ProgressBarService,
              private searchService: SearchService,
              private changeDetectionRef: ChangeDetectorRef) {
    this.currentPhrase = searchService.currentPhrase;
  }


  isNotLoading(): boolean {
    return !this.progressBarService.progressSub.getValue();
  }


  detectChanges(): void {
    this.changeDetectionRef.detectChanges();
  }
}
