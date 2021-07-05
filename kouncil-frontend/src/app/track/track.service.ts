import {Injectable} from '@angular/core';
import {Message} from '../topic/message';
import {Observable} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';

@Injectable({
  providedIn: 'root'
})
export abstract class TrackService {

  protected constructor() {
  }

  abstract getEvents(serverId: string,
                     topicNames: string[],
                     field: string,
                     value: string,
                     beginningTimestampMillis: number,
                     endTimestampMillis: number): Observable<Message[]>;

  abstract getSearchableTopics(): string[];

  setTrackFilter(trackFilter: TrackFilter) {
    console.log(trackFilter);
  }
}
