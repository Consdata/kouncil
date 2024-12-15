import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Topics} from '@app/common-model';
import {TopicsService} from '../topics.service';

@Injectable({
  providedIn: 'root'
})
export class TopicsBackendService implements TopicsService {

  constructor(private http: HttpClient) {
  }

  getTopics$(serverId: string): Observable<Topics> {
    if (serverId) {
      const params = new HttpParams().set('serverId', serverId);
      return this.http.get<Topics>(`/api/topics`, {params});
    }
    return of({topics: []});
  }
}
