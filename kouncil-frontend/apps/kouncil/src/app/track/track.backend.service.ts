import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Message} from '../topic/message';
import {Observable} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';
import {parse} from 'date-fns';
import {TRACK_DATE_FORMAT} from './track-date-format';
import {RxStompService} from '@stomp/ng2-stompjs';

@Injectable({
  providedIn: 'root'
})
export class TrackBackendService extends TrackService {

  asyncEnabled: boolean = true;

  constructor(private http: HttpClient, private rxStompService: RxStompService) {
    super();
  }

  private static convertToTimestamp(dateTime: string): number {
    return parse(dateTime, TRACK_DATE_FORMAT, new Date()).getTime();
  }

  getEvents$(serverId: string, trackFilter: TrackFilter, asyncHandle?: string): Observable<Message[]> {
    const url = this.asyncEnabled ? '/api/track/async' : '/api/track/sync';
    const params = new HttpParams()
      .set('serverId', serverId)
      .set('topicNames', trackFilter.topics.join(','))
      .set('field', trackFilter.field)
      .set('operator', trackFilter.operator)
      .set('value', trackFilter.value)
      .set('beginningTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.startDateTime))
      .set('endTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.stopDateTime))
      .set('asyncHandle', this.asyncEnabled ? asyncHandle : '');
    return this.http.get<Message[]>(url, {params});
  }

  isAsyncEnable(): boolean {
    return this.asyncEnabled;
  }

  toggleAsyncMode(): void {
    this.asyncEnabled = !this.asyncEnabled;
    if (this.asyncEnabled) {
      this.rxStompService.activate();
    } else {
      this.rxStompService.deactivate();
    }
  }

}
