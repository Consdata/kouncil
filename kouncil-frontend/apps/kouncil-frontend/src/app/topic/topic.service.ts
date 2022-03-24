import {TopicMessages} from './topic-messages';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '../app.backend';
import {TopicBackendService} from './topic.backend.service';
import {ProgressBarService} from '../util/progress-bar.service';
import {TopicDemoService} from './topic.demo.service';
import {Page} from './page';
import {Injectable} from '@angular/core';

@Injectable()
export abstract class TopicService {

  abstract getMessages(serverId: string, topicName: string, offset?: number): void;

  abstract selectPartition(serverId: string, partition: number, topicName: string): void;

  abstract selectAllPartitions(serverId: string, topicName: string): void ;

  abstract getConvertTopicMessagesJsonToGridObservable(): Observable<TopicMessages>;

  abstract getNumberOfPartitionsObservable(): Observable<number>;

  abstract paginateMessages(serverId: string, event: any, topicName: string): void;

  abstract goToOffset(serverId: string, topicName: string, offset?: number): void;

  abstract getPagination$(): Observable<Page>;
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
