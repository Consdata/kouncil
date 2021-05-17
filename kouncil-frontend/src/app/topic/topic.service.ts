import {TopicMessages} from './topic';
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

  getMessages(topicName: string) {
  }

  togglePartition(nr: any, topicName: string) {
  }

  selectPartition(partition: number, topicName: string) {
  }

  selectAllPartitions(topicName: string) {
  }

  previous() {
  }

  next() {
  }

  hasNoMorePrevValues(): boolean {
    return undefined;
  }

  hasNoMoreNextValues(): boolean {
    return undefined;
  }

  getConvertTopicMessagesJsonToGridObservable(): Observable<TopicMessages> {
    return undefined;
  }

  getPartitionOffset(partitionNr: number): string {
    return undefined;
  }

  showMorePartitions(): boolean {
    return undefined;
  }

  getSelectedPartitionsObservable(): Observable<number[]> {
    return undefined;
  }

  getVisiblePartitionsObservable(): Observable<number[]> {
    return undefined;
  }

  isOnePartitionSelected$(): Observable<boolean> {
    return undefined;
  }

  paginateMessages(event: any, topicName: string) {
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
