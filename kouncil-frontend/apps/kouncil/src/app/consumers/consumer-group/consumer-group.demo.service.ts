import {Injectable} from '@angular/core';
import {ConsumerGroupService} from './consumer-group.service';
import {from, Observable} from 'rxjs';
import {demoConsumerGroup} from './consumer-group.demo.data';
import {ConsumerGroupResponse} from '@app/common-model';

@Injectable()
export class ConsumerGroupDemoService implements ConsumerGroupService {
  getConsumerGroup$(
    serverId: string,
    groupId: string
  ): Observable<ConsumerGroupResponse> {
    return from([{consumerGroupOffset: demoConsumerGroup[groupId]}]);
  }
}
