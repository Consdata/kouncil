import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConsumerGroupResponse} from './consumer-group';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Backend} from '../../app.backend';
import {ConsumerGroupBackendService} from './consumer-group.backend.service';
import {ConsumerGroupDemoService} from './consumer-group.demo.service';

@Injectable()
export abstract class ConsumerGroupService {

  abstract getConsumerGroup$(serverId: string, groupId: string): Observable<ConsumerGroupResponse>;
}

export function consumerGroupServiceFactory(http: HttpClient): ConsumerGroupService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ConsumerGroupBackendService(http);
    }
    case Backend.DEMO: {
      return new ConsumerGroupDemoService();
    }
  }
}
