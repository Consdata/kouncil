import {Injectable, QueryList} from '@angular/core';
import {Observable, of} from 'rxjs';
import {SurveyService} from './survey.service';
import {
  SurveyScaleQuestionComponent
} from './survey-scale-question/survey-scale-question.component';
import {SurveyPending, SurveyQuestion} from './model/survey.model';

@Injectable()
export class SurveyDemoService implements SurveyService {

  constructor() {
  }

  fetchSurveyBasePath$(): Observable<boolean> {
    return of(false);
  }

  fetchSurvey$(_route: string): void {
  }

  answerSurvey$(_questionComponents: QueryList<SurveyScaleQuestionComponent>, _route: string): void {
  }

  get showPanelObservable$(): Observable<boolean> {
    return of(false);
  }

  getSurveyObservable$(): Observable<SurveyPending> {
    return of();
  }

  getQuestionsChanged$(): Observable<Array<SurveyQuestion>> {
    return of();
  }
}
