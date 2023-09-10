import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {SurveyService} from './survey.service';
import {SurveyPending, SurveyQuestion} from './model/survey.model';
import {Router} from '@angular/router';
import {
  SurveyAnswer,
  SurveyQuestionResult,
  SurveyResultStatus,
  SurveyResultValue
} from './model/survey-answer';
import {
  SurveyScaleQuestionComponent
} from './survey-scale-question/survey-scale-question.component';

@Component({
  selector: 'app-survey',
  template: `
    <div *ngIf="showPanel" class="container" [ngClass]="{'hide': hidePanel}">
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
          <button mat-button (click)="confirmSurvey()" class="survey-accept-button">
            <span class="survey-button-label">Accept</span>
            <mat-icon class="survey-accept-button-icon">done</mat-icon>
          </button>
          <button mat-button (click)="closeSurvey()" class="survey-close-button">
            <span class="survey-button-label">Close</span>
            <mat-icon class="survey-close-button-icon">close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./survey.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SurveyComponent implements OnInit {

  showPanel: boolean = false;
  hidePanel: boolean = false;
  survey: SurveyPending;
  questions: SurveyQuestion[];
  position: string;

  @ViewChildren(SurveyScaleQuestionComponent) questionComponents: QueryList<SurveyScaleQuestionComponent>;

  constructor(private surveyService: SurveyService, private router: Router, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.fetchSurveyBasePath();
  }

  rejectSurvey(): void {
    this.hidePanel = true;
    this.surveyService.answerSurvey$({
      status: SurveyResultStatus.DISCARDED,
      sentId: this.survey.sentId,
      position: ''
    } as SurveyAnswer).pipe().subscribe(() => {
      setTimeout(() => {
        this.fetchSurvey();
      }, 2000);

    });
  }

  confirmSurvey(): void {
    this.closeSurvey();

    const answers = [];
    this.questionComponents.forEach(component => {
      answers.push({
        questionId: component.question.id,
        value: String(component.selectedValue),
        answer: component.reason
      } as SurveyQuestionResult);
    });

    this.surveyService.answerSurvey$({
      status: SurveyResultStatus.FILLED,
      sentId: this.survey.sentId,
      position: this.position,
      result: {
        questions: answers
      } as SurveyResultValue
    } as SurveyAnswer).pipe().subscribe(() => {
      setTimeout(() => {
        this.fetchSurvey();
      }, 2000);

    });
  }

  private fetchSurvey(): void {
    this.surveyService.fetchSurvey$().pipe().subscribe(result => {
      if (result.length > 0) {
        this.survey = result[0];
        this.showPanel = this.survey.triggers.some(trigger => {
          if (this.router.url.endsWith(trigger.elementId)) {
            this.position = trigger.elementId;
            return true;
          }
          return false;
        });
        const surveyDesign = JSON.parse(this.survey.surveyDefinition.design);
        this.questions = surveyDesign['questions'];
        this.surveyService.markSurveyAsOpened(this.survey.sentId);
        this.cdr.detectChanges();
      }
    });
  }

  closeSurvey(): void {
    this.hidePanel = true;
  }

  private fetchSurveyBasePath() {
    this.surveyService.fetchSurveyBasePath$().subscribe((urlExist) => {
      if (urlExist) {
        this.fetchSurvey();
      }
    });
  }
}
