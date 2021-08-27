import {ChangeDetectorRef, Component, Input} from '@angular/core';
import {ProgressBarService} from '../util/progress-bar.service';
import {SearchService} from '../search.service';

@Component({
  selector: 'app-no-data-placeholder',
  templateUrl: './no-data-placeholder.component.html',
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
