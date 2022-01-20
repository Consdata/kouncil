import {Injectable} from '@angular/core';
import {ConsumerGroupService} from './consumer-group.service';
import {from, Observable} from 'rxjs';
import {ConsumerGroupResponse} from './consumer-group';
import {demoConsumerGroup} from './consumer-group.demo.data';

@Injectable()
export class ConsumerGroupDemoService implements ConsumerGroupService {

  constructor() {
  }

  getConsumerGroup(serverId: string, groupId: string): Observable<ConsumerGroupResponse> {
    return from([{consumerGroupOffset: demoConsumerGroup[groupId]}]);
  }
}
