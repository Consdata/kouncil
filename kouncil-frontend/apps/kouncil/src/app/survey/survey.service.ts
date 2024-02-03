import {Injectable, QueryList} from '@angular/core';
import {Observable} from 'rxjs';
import {
  SurveyScaleQuestionComponent
} from './survey-scale-question/survey-scale-question.component';
import {SurveyPending, SurveyQuestion} from './model/survey.model';

@Injectable()
export abstract class SurveyService {

  abstract fetchSurveyBasePath$(): Observable<boolean>;

  abstract fetchSurvey$(route: string): void;

  abstract answerSurvey$(questionComponents: QueryList<SurveyScaleQuestionComponent>, route: string): void;

  abstract get showPanelObservable$(): Observable<boolean>;

  abstract getSurveyObservable$(): Observable<SurveyPending>;

  abstract getQuestionsChanged$(): Observable<Array<SurveyQuestion>>;
}
