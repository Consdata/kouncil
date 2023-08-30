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

  constructor(protected http: HttpClient) {
  }

  fetchSurvey$(): Observable<Array<SurveyPending>> {
    return this.http.post<Array<SurveyPending>>(`http://localhost:8082/kouncil/result/pending-with-definition/${localStorage.getItem('userId')}`, {
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
    return this.http.patch<void>(`http://localhost:8082/kouncil/result/answer/${localStorage.getItem('userId')}`, answer);
  }

  markSurveyAsOpened(sentId: string): void {
    const params = {'sentId': sentId};
    this.http.post<void>(`http://localhost:8082/kouncil/activity/SURVEY_OPENED/${localStorage.getItem('userId')}`, {}, {
      params
    }).pipe().subscribe();
  }
}
