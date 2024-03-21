import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';
import {parse} from 'date-fns';
import {TRACK_DATE_FORMAT} from './track-date-format';
import {MessageData} from '@app/message-data';
import {RxStompService} from '../rx-stomp.service';

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

  getEvents$(serverId: string, trackFilter: TrackFilter, asyncHandle?: string): Observable<MessageData[]> {
    const url = this.asyncEnabled ? './api/track/async' : './api/track/sync';
    const params = new HttpParams()
      .set('serverId', serverId)
      .set('topicNames', trackFilter.topics.join(','))
      .set('field', trackFilter.field)
      .set('operator', trackFilter.operator)
      .set('value', trackFilter.value)
      .set('beginningTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.startDateTime))
      .set('endTimestampMillis', TrackBackendService.convertToTimestamp(trackFilter.stopDateTime))
      .set('asyncHandle', this.asyncEnabled ? asyncHandle : '');
    return this.http.get<MessageData[]>(url, {params});
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
