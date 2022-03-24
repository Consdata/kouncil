import {EventEmitter, Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable, Subject} from 'rxjs';
import {TrackFilter, TrackOperator} from './track-filter/track-filter';
import {addMinutes, format} from 'date-fns';
import {TRACK_DATE_FORMAT} from './track-date-format';

@Injectable()
export abstract class TrackService {

  private trackFilter?: TrackFilter;
  private trackFilterChange$: Subject<TrackFilter> = new Subject<TrackFilter>();
  trackFilterChange$: Observable<TrackFilter> = this.trackFilterChange$.asObservable();
  trackFinished: EventEmitter<void> = new EventEmitter<void>();

  abstract getEvents(serverId: string, trackFilter: TrackFilter, asyncHandle?: string): Observable<Message[]>;

  setTrackFilter(trackFilter: TrackFilter): void {
    this.trackFilterChange$.next(trackFilter);
  }

  abstract isAsyncEnable(): boolean;
  abstract toggleAsyncMode(): void;

  storeTrackFilter(field: string, value: string, timestamp: number, topicName: string): void {
    this.trackFilter = new TrackFilter(
      field,
      TrackOperator['is'],
      value,
      format(new Date(timestamp), TRACK_DATE_FORMAT),
      format(addMinutes(new Date(timestamp), 1), TRACK_DATE_FORMAT),
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
      format(from, TRACK_DATE_FORMAT),
      format(new Date(), TRACK_DATE_FORMAT),
      []);
  }
}
