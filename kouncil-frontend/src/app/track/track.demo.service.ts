import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {Message} from '../topic/message';
import {MessageHeader} from '../topic/message-header';
import {from, Observable} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';

@Injectable({
  providedIn: 'root'
})
export class TrackDemoService extends TrackService {

  constructor() {
    super();
  }

  getEvents(serverId: string, trackFilter: TrackFilter): Observable<Message[]> {
    return from([[
      new Message('key1', '{"test":"incoming"}', 10, 4, new Date().getTime(), [new MessageHeader('traceId', '666')], 'incoming-transactions'),
      new Message('key2', '{"test":"settled"}', 11231231232, 14, new Date().getTime(), [new MessageHeader('traceId', '666')], 'settled-transactions'),
      new Message('key3', '{"test":"reconciled"}', 1032132132, 1, new Date().getTime(), [new MessageHeader('traceId', '666')], 'reconciled-transactions')]]);
  }

}
