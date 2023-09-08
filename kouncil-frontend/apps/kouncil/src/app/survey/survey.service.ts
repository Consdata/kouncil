import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SurveyPending} from './model/survey.model';
import {SurveyAnswer} from './model/survey-answer';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  surveyBasePath: string;

  constructor(protected http: HttpClient) {
  }

  fetchSurvey$(): Observable<Array<SurveyPending>> {
    return this.http.post<Array<SurveyPending>>(`${this.surveyBasePath}/result/pending-with-definition/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, {
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
    }).pipe(map(data => {
      return data;
    }));
  }

  answerSurvey$(answer: SurveyAnswer): Observable<void> {
    return this.http.patch<void>(`${this.surveyBasePath}/result/answer/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, answer);
  }

  markSurveyAsOpened(sentId: string): void {
    const params = {'sentId': sentId};
    this.http.post<void>(`${this.surveyBasePath}/activity/SURVEY_OPENED/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, {}, {
      params
    }).pipe().subscribe();
  }

  fetchSurveyBasePath$(): Observable<void> {
    return this.http.get('/api/survey/config', {responseType: 'text'}).pipe(map((basePath) => {
      this.surveyBasePath = basePath;
    }));
  }
}
