import {Injectable} from '@angular/core';
import {TrackService} from './track.service';
import {Message} from '../topic/message';
import {from, Observable, of} from 'rxjs';
import {TrackFilter} from './track-filter/track-filter';
import {concatMap, delay, finalize} from 'rxjs/operators';
import {Crypto} from '../util/crypto';
import {RandomUtils} from '../util/random-utils';
import {demoTopics} from '../topics/topics.demo.data';
import * as moment from 'moment';
import {MessageHeader} from '../topic/message-header';

@Injectable({
  providedIn: 'root'
})
export class TrackDemoService extends TrackService {

  constructor() {
    super();
  }

  getEvents(serverId: string, trackFilter: TrackFilter): Observable<Message[]> {
    const numberOfMessages = RandomUtils.randomInt(3, 10);
    const traceId = Math.random().toString(36).slice(2);
    const userId = RandomUtils.randomInt(100000000, 200000000).toString(10);
    const answer = [];
    for (let i = 0; i < numberOfMessages; i++) {
      answer.push(this.generateMessage(trackFilter, traceId, userId));
    }

    return from(answer)
      .pipe(concatMap(item => {
        return of([item]).pipe(delay(RandomUtils.randomInt(500, 1500)));
      }), finalize(() => {
        this.trackFinished.emit();
      }));
  }

  private generateMessage(trackFilter: TrackFilter, traceId: string, userId: string): Message {
    const key = Crypto.uuidv4();
    const event = RandomUtils.createRandomEvent();
    const offset = RandomUtils.randomInt(100000000, 200000000);
    let topic;
    if (!!trackFilter.topics && trackFilter.topics.length > 0) {
      const topicName = trackFilter.topics[Math.floor(Math.random() * trackFilter.topics.length)];
      topic = demoTopics.filter(t => t.name === topicName)[0];
    } else {
      topic = demoTopics[Math.floor(Math.random() * demoTopics.length)];
    }
    const partition = RandomUtils.randomInt(0, topic.partitions);
    const fromDate = moment(trackFilter.startDateTime, moment.HTML5_FMT.DATETIME_LOCAL).toDate();
    const toDate = moment(trackFilter.stopDateTime, moment.HTML5_FMT.DATETIME_LOCAL).toDate();
    const date = RandomUtils.randomDate(fromDate, toDate).getTime();

    const headers = [
      new MessageHeader('traceId', traceId),
      new MessageHeader('userId', userId)
    ];
    if (!!trackFilter.field) {
      headers.push(new MessageHeader(trackFilter.field, trackFilter.value));
    }

    return new Message(key, event, offset, partition, date, headers, topic.name);
  }

  isAsyncEnable(): boolean {
    return false;
  }

}
