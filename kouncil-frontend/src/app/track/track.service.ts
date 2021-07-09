import {Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable, Subject} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export abstract class TrackService {

  protected constructor() {
  }

  private trackFilter: TrackFilter;
  private trackFilterChange: Subject<TrackFilter> = new Subject<TrackFilter>();
  trackFilterChange$: Observable<TrackFilter> = this.trackFilterChange.asObservable();
  private readonly _format = 'YYYY-MM-DDTHH:mm';

  abstract getEvents(serverId: string, trackFilter: TrackFilter, asyncHandle: string): Observable<Message[]>;

  setTrackFilter(trackFilter: TrackFilter) {
    this.trackFilterChange.next(trackFilter);
  }

  abstract isAsyncEnable(): boolean;

  storeTrackFilter(field: string, value: string, timestamp: number, topicName: string) {
    const date = new Date(timestamp);
    date.setMinutes(date.getMinutes() + 1);
    this.trackFilter = new TrackFilter(
      field,
      value,
      moment(new Date(timestamp)).format(this._format),
      moment(date).format(this._format),
      [topicName]);
  }

  getStoredTrackFilter() {
    if (this.trackFilter === undefined) {
      const from = new Date();
      from.setMinutes(from.getMinutes() - 5);
      return new TrackFilter(
        '',
        '',
        moment(from).format(this._format),
        moment(new Date()).format(this._format),
        []);
    } else {
      return this.trackFilter;
    }
  }
}
