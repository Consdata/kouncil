import {Injectable, QueryList} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {SurveyPending, SurveyQuestion} from './model/survey.model';
import {
  SurveyAnswer,
  SurveyQuestionResult,
  SurveyResultStatus,
  SurveyResultValue
} from './model/survey-answer';
import {
  SurveyScaleQuestionComponent
} from './survey-scale-question/survey-scale-question.component';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  surveyBasePath: string;
  private header: string = 'x-api-key';
  private secret: string = ']TCz)x\'t~$"UeRgZ;zt*:YK=W-`Xtq(<]@GtTL;DNf+eW';

  private showPanelChanged$: Subject<boolean> = new Subject<boolean>();
  private surveyChanged$: Subject<SurveyPending> = new Subject<SurveyPending>();
  private questionsChanged$: Subject<Array<SurveyQuestion>> = new Subject<Array<SurveyQuestion>>();

  private survey: SurveyPending;
  private questions: SurveyQuestion[];
  private position: string;

  constructor(protected http: HttpClient) {
  }

  fetchSurvey$(route: string): void {
    this.fetchSurveyBasePath$().subscribe((urlExist) => {
      if (urlExist) {
        this.fetchSurvey(route);
      }
    });
  }

  private fetchSurvey(route: string): void {
    this.http.post<Array<SurveyPending>>(
      `${this.surveyBasePath}/result/pending-with-definition/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`,
      {
        receiverAttributes: [
          {
            name: 'kouncil-user-id',
            value: localStorage.getItem('userId')
          },
          {
            name: 'installation-id',
            value: localStorage.getItem('installationId')
          }
        ]
      }, {
        headers: this.getHeaders()
      }).subscribe(data => {
      this.processSurvey(data, route);
    });
  }

  answerSurvey$(questionComponents: QueryList<SurveyScaleQuestionComponent>, route: string): void {
    const answer = this.prepareSurveyAnswer(questionComponents);

    this.http.patch<void>(`${this.surveyBasePath}/result/answer/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, answer, {
      headers: this.getHeaders()
    }).subscribe(() => {
      setTimeout(() => {
        this.fetchSurvey$(route);
      }, 2000);
    });
  }

  markSurveyAsOpened(sentId: string): void {
    const params = {'sentId': sentId};
    this.http.post<void>(`${this.surveyBasePath}/activity/SURVEY_OPENED/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, {}, {
      headers: this.getHeaders(),
      params
    }).pipe().subscribe();
  }

  fetchSurveyBasePath$(): Observable<boolean> {
    return this.http.get('/api/survey/config', {responseType: 'text'}).pipe(map((basePath) => {
      this.surveyBasePath = basePath;
      return this.surveyBasePath.length > 0;
    }));
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set(this.header, this.secret);
  }

  get showPanelObservable$(): Observable<boolean> {
    return this.showPanelChanged$.asObservable();
  }

  private processSurvey(result: Array<SurveyPending>, route: string): void {
    if (result.length > 0) {
      this.survey = result[0];
      this.surveyChanged$.next(this.survey);

      this.showPanelChanged$.next(
        this.survey.triggers.some(trigger => {
          if (route.endsWith(trigger.elementId)) {
            this.position = trigger.elementId;
            return true;
          }
          return false;
        })
      );

      const surveyDesign = JSON.parse(this.survey.surveyDefinition.design);
      this.questions = surveyDesign['questions'];
      this.questionsChanged$.next(this.questions);
      this.markSurveyAsOpened(this.survey.sentId);
    } else {
      this.showPanelChanged$.next(false);
    }
  }

  getSurveyObservable$(): Observable<SurveyPending> {
    return this.surveyChanged$.asObservable();
  }

  getQuestionsChanged$(): Observable<Array<SurveyQuestion>> {
    return this.questionsChanged$.asObservable();
  }

  private prepareSurveyAnswer(questionComponents: QueryList<SurveyScaleQuestionComponent>): SurveyAnswer {
    const answers = [];
    questionComponents.forEach(component => {
      answers.push({
        questionId: component.question.id,
        value: String(component.selectedValue),
        answer: component.reason
      } as SurveyQuestionResult);
    });

    return {
      status: SurveyResultStatus.FILLED,
      sentId: this.survey.sentId,
      position: this.position,
      result: {
        questions: answers
      } as SurveyResultValue
    } as SurveyAnswer;
  }

}
