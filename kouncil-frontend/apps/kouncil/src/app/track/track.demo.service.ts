import { Injectable } from '@angular/core';
import { TrackService } from './track.service';
import { from, Observable, of } from 'rxjs';
import { TrackFilter } from './track-filter/track-filter';
import { concatMap, delay, finalize } from 'rxjs/operators';
import { parse } from 'date-fns';
import { TRACK_DATE_FORMAT } from './track-date-format';
import {MessageData, MessageDataHeader} from '@app/message-data';
import {RandomUtils, Crypto} from '@app/common-utils';
import {demoTopics} from '@app/feat-topics';
import {RxStompService} from "../rx-stomp.service";

@Injectable()
export class TrackDemoService extends TrackService {
  constructor(private rxStompService: RxStompService) {
    super();
    rxStompService.deactivate();
  }

  getEvents$(serverId: string, trackFilter: TrackFilter): Observable<MessageData[]> {
    const numberOfMessages = RandomUtils.randomInt(3, 10);
    const traceId = Math.random().toString(36).slice(2);
    const userId = RandomUtils.randomInt(100000000, 200000000).toString(10);
    const answer: MessageData[] = [];
    for (let i = 0; i < numberOfMessages; i++) {
      answer.push(this.generateMessage(trackFilter, traceId, userId));
    }

    return from(answer).pipe(
      concatMap((item) => {
        return of([item]).pipe(delay(RandomUtils.randomInt(500, 1500)));
      }),
      finalize(() => {
        this.trackFinished.emit();
      })
    );
  }

  isAsyncEnable(): boolean {
    return false;
  }

  toggleAsyncMode(): void {
    // not implemented
  }

  private generateMessage(
    trackFilter: TrackFilter,
    traceId: string,
    userId: string
  ): MessageData {
    const key = Crypto.uuidv4();
    const event = RandomUtils.createRandomEvent();
    const offset = RandomUtils.randomInt(100000000, 200000000);
    let topic;
    if (!!trackFilter.topics && trackFilter.topics.length > 0) {
      const topicName =
        trackFilter.topics[
          Math.floor(Math.random() * trackFilter.topics.length)
        ];
      topic = demoTopics.filter((t) => t.name === topicName)[0];
    } else {
      topic = demoTopics[Math.floor(Math.random() * demoTopics.length)];
    }
    const partition = RandomUtils.randomInt(0, topic.partitions);
    const fromDate = parse(
      trackFilter.startDateTime,
      TRACK_DATE_FORMAT,
      new Date()
    );
    const toDate = parse(
      trackFilter.stopDateTime,
      TRACK_DATE_FORMAT,
      new Date()
    );

    const date = RandomUtils.randomDate(fromDate, toDate).getTime();

    const headers = [
      {key: 'traceId', value: traceId} as MessageDataHeader,
      {key: 'userId', value: userId}  as MessageDataHeader,
    ];
    if (trackFilter.field) {
      headers.push({key: trackFilter.field, value: trackFilter.value} as MessageDataHeader);
    }

    return {
      key: key,
      value: event,
      offset: offset,
      partition: partition,
      timestamp: date,
      headers: headers,
      topicName: topic.name
    } as MessageData;
  }
}
