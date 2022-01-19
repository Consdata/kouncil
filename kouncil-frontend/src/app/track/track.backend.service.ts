import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Message} from '../topic/message';
import {Observable} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';

@Injectable({
  providedIn: 'root'
})
export class TrackBackendService extends TrackService {

  constructor(private http: HttpClient) {
    super();
  }

  private static convertToTimestamp(dateTime: string): number {
    return new Date(dateTime).getTime();
  }

  getEvents(serverId: string, trackFilter: TrackFilter, asyncHandle: string): Observable<Message[]> {
    const url = asyncHandle !== undefined ? '/api/track/async' : '/api/track/sync';
    const params = new HttpParams()
      .set('serverId', serverId)
      .set('topicNames', trackFilter.topics.join(','))
      .set('field', trackFilter.field)
      .set('operator', trackFilter.operator)
      .set('value', trackFilter.value)
      .set('beginningTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.startDateTime))
      .set('endTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.stopDateTime))
      .set('asyncHandle', asyncHandle !== undefined ? asyncHandle : '');
    return this.http.get<Message[]>(url, {params});
  }

  isAsyncEnable(): boolean {
    return true;
  }

}
