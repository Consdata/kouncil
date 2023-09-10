import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SurveyPending} from './model/survey.model';
import {SurveyAnswer} from './model/survey-answer';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {

  surveyBasePath: string;
  private header: string = 'x-api-key';
  private secret: string = ']TCz)x\'t~$"UeRgZ;zt*:YK=W-`Xtq(<]@GtTL;DNf+eW';

  constructor(protected http: HttpClient) {
  }

  fetchSurvey$(): Observable<Array<SurveyPending>> {
    return this.http.post<Array<SurveyPending>>(
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
      }).pipe(map(data => {
      return data;
    }));
  }

  answerSurvey$(answer: SurveyAnswer): Observable<void> {
    return this.http.patch<void>(`${this.surveyBasePath}/result/answer/${localStorage.getItem('userId')}/${localStorage.getItem('installationId')}`, answer, {
      headers: this.getHeaders()
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
}
