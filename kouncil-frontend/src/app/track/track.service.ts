import {EventEmitter, Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable, Subject} from 'rxjs';
import {TrackFilter, TrackOperator} from './track-filter/track-filter';
import {addMinutes, format} from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export abstract class TrackService {

  private trackFilter: TrackFilter;
  private trackFilterChange: Subject<TrackFilter> = new Subject<TrackFilter>();
  trackFilterChange$: Observable<TrackFilter> = this.trackFilterChange.asObservable();
  protected readonly _format = "yyyy-MM-dd'T'HH:mm";
  trackFinished = new EventEmitter<any>();

  abstract getEvents(serverId: string, trackFilter: TrackFilter, asyncHandle: string): Observable<Message[]>;

  setTrackFilter(trackFilter: TrackFilter) {
    this.trackFilterChange.next(trackFilter);
  }

  abstract isAsyncEnable(): boolean;

  storeTrackFilter(field: string, value: string, timestamp: number, topicName: string) {
    this.trackFilter = new TrackFilter(
      field,
      TrackOperator['is'],
      value,
      format(new Date(), this._format),
      format(addMinutes(new Date(), 1), this._format),
      [topicName]);
  }

  getStoredTrackFilter(): TrackFilter {
    if (this.trackFilter === undefined) {
      console.log('trackFilter', this.defaultFilter());
      return this.defaultFilter();
    } else {
      console.log('trackFilter', this.trackFilter);
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
      format(from, this._format),
      format(new Date(), this._format),
      []);
  }
}
