import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {SurveyService} from './survey.service';
import {SurveyPending, SurveyQuestion} from './model/survey.model';
import {Router} from '@angular/router';
import {
  SurveyScaleQuestionComponent
} from './survey-scale-question/survey-scale-question.component';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {Observable, Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarComponent, SnackBarData, SnackBarType} from '@app/common-utils';

@Component({
  standalone: true,
  imports: [CommonModule, SurveyScaleQuestionComponent, MatIconModule, MatButtonModule],
  selector: 'app-survey',
  template: `
    <div *ngIf="showPanel$ | async" class="container" [ngClass]="{'hide': hidePanel}">
      <div id="inner" class="inner">
        <div class="survey-description" style="padding-top: 10px;"
             [innerHTML]="survey.surveyDefinition.message">
        </div>

        <div class="survey-frame">
          <ng-container *ngFor="let question of questions">
            <app-survey-scale-question [question]="question"></app-survey-scale-question>
          </ng-container>
        </div>

        <div class="survey-buttons-container">
          <button mat-button (click)="confirmSurvey()" class="action-button-green">
            Accept
            <mat-icon class="material-symbols-outlined">done</mat-icon>
          </button>
          <button mat-button (click)="closeSurvey()" class="action-button-red">
            Close
            <mat-icon class="material-symbols-outlined">close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./survey.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SurveyComponent implements OnInit, OnDestroy {

  showPanel$: Observable<boolean> = this.surveyService.showPanelObservable$;
  hidePanel: boolean = false;
  survey: SurveyPending;
  questions: SurveyQuestion[];
  subscriptions: Subscription = new Subscription();

  @ViewChildren(SurveyScaleQuestionComponent) questionComponents: QueryList<SurveyScaleQuestionComponent>;

  constructor(private surveyService: SurveyService, private router: Router,
              private snackbar: MatSnackBar) {
    this.subscriptions.add(this.surveyService.getSurveyObservable$().subscribe(value => {
      this.survey = value;
    }));

    this.subscriptions.add(this.surveyService.getQuestionsChanged$().subscribe(value => {
      this.questions = value;
    }));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  confirmSurvey(): void {
    let valid = true;
    this.questionComponents.forEach(component => {
      if (component.question.required && (component.selectedValue === undefined
        || (component.isInRange() && (component.reason === undefined || component.reason.trim().length <= 0)))) {
        valid = false;
      }
    });

    if (valid) {
      this.closeSurvey();
      this.surveyService.answerSurvey$(this.questionComponents, this.router.url);
    } else {
      this.snackbar.openFromComponent(SnackBarComponent, {
        data: new SnackBarData(`Answer required questions`, SnackBarType.ERROR),
        panelClass: ['snackbar', 'snackbar-container-error'],
        duration: 5000
      });
    }
  }

  closeSurvey(): void {
    this.hidePanel = true;
  }
}
