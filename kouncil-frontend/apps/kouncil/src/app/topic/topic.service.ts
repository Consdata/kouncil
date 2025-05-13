import {TopicMessages} from './topic-messages';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {TopicBackendService} from './topic.backend.service';
import {TopicDemoService} from './topic.demo.service';
import {Page} from './page';
import {Injectable} from '@angular/core';
import {Backend} from '@app/common-model';
import {ProgressBarService} from '@app/common-utils';

@Injectable()
export abstract class TopicService {

  abstract getMessages(serverId: string, topicName: string, offset?: number): void;

  abstract selectPartition(serverId: string, partition: number, topicName: string): void;

  abstract selectAllPartitions(serverId: string, topicName: string): void ;

  abstract getConvertTopicMessagesJsonToGridObservable$(): Observable<TopicMessages>;

  abstract getNumberOfPartitionsObservable$(): Observable<number>;

  abstract paginateMessages(serverId: string, event: { page: number }, topicName: string): void;

  abstract goToOffset(serverId: string, topicName: string, offset?: number): void;

  abstract getPagination$(): Observable<Page>;

  abstract isTopicExist$(serverId: string, topicName: string): Observable<boolean>;
}

export function topicServiceFactory(http: HttpClient, progressBarService: ProgressBarService): TopicService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TopicBackendService(http, progressBarService);
    }
    case Backend.DEMO:
    default:
      return new TopicDemoService(http, progressBarService);
  }
}

export const topicServiceProvider = {
  provide: TopicService,
  useFactory: topicServiceFactory,
  deps: [HttpClient, ProgressBarService]
};
