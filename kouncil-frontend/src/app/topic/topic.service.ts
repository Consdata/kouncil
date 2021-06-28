import {TopicMessages} from './topic-messages';
import {Observable} from 'rxjs';
import {Page} from './page';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '../app.backend';
import {TopicBackendService} from './topic.backend.service';
import {ProgressBarService} from '../util/progress-bar.service';
import {TopicDemoService} from './topic.demo.service';

export class TopicService {

  constructor() {
  }

  getMessages(serverId: string, topicName: string) {
  }

  selectPartition(serverId: string, partition: number, topicName: string) {
  }

  selectAllPartitions(serverId: string, topicName: string) {
  }

  getConvertTopicMessagesJsonToGridObservable(): Observable<TopicMessages> {
    return undefined;
  }

  getNumberOfPartitionsObservable(): Observable<number> {
    return undefined;
  }

  paginateMessages(serverId: string, event: any, topicName: string) {
    return undefined;
  }

  getPagination$(): Observable<Page> {
    return undefined;
  }
}

export function topicServiceFactory(http: HttpClient, progressBarService: ProgressBarService): TopicService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TopicBackendService(http, progressBarService);
    }
    case Backend.DEMO: {
      return new TopicDemoService(http, progressBarService);
    }
  }
}

export const topicServiceProvider = {
  provide: TopicService,
  useFactory: topicServiceFactory,
  deps: [HttpClient, ProgressBarService]
};
