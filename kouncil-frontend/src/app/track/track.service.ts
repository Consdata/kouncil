import {EventEmitter, Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable, Subject} from 'rxjs';
import {TrackFilter, TrackOperator} from './track-filter/track-filter';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export abstract class TrackService {

  private trackFilter: TrackFilter;
  private trackFilterChange: Subject<TrackFilter> = new Subject<TrackFilter>();
  trackFilterChange$: Observable<TrackFilter> = this.trackFilterChange.asObservable();
  private readonly _format = 'YYYY-MM-DDTHH:mm';
  trackFinished = new EventEmitter<any>();

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
      TrackOperator['is'],
      value,
      moment(new Date(timestamp)).format(this._format),
      moment(date).format(this._format),
      [topicName]);
  }

  getStoredTrackFilter(): TrackFilter {
    if (this.trackFilter === undefined) {
      return this.defaultFilter();
    } else {
      return this.trackFilter;
    }
  }

  defaultFilter(): TrackFilter {
    const from = new Date();
    from.setMinutes(from.getMinutes() - 5);
    return new TrackFilter(
      '',
      TrackOperator['~'],
      '',
      moment(from).format(this._format),
      moment(new Date()).format(this._format),
      []);
  }
}
