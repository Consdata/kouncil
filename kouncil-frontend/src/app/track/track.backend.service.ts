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

  private static convertToTimestamp(dateTime: string) {
    return new Date(dateTime).getTime();
  }

  getEvents(serverId: string, trackFilter: TrackFilter): Observable<Message[]> {
    const url = '/api/track';
    const params = new HttpParams()
      .set('serverId', serverId)
      .set('topicNames', trackFilter.topics.join(','))
      .set('field', trackFilter.field)
      .set('value', trackFilter.value)
      .set('beginningTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.startDateTime))
      .set('endTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.stopDateTime));
    return this.http.get<Message[]>(url, {params});
  }

}