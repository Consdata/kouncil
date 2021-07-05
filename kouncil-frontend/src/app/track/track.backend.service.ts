import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Message} from '../topic/message';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrackBackendService extends TrackService {

  constructor(private http: HttpClient) {
    super();
  }

  getEvents(serverId: string, topicNames: string[], field: string, value: string, beginningTimestampMillis: number, endTimestampMillis: number): Observable<Message[]> {
    const url = '/api/track';
    const params = new HttpParams()
      .set('serverId', serverId)
      .set('topicNames', topicNames.join(','))
      .set('field', field)
      .set('value', value)
      .set('beginningTimestampMillis', beginningTimestampMillis)
      .set('endTimestampMillis', endTimestampMillis);

    return this.http.get<Message[]>(url, {params});
  }

  getSearchableTopics(): string[] {
    return [];
  }
}
