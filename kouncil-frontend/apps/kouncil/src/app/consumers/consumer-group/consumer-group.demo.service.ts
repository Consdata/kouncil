import {Injectable} from '@angular/core';
import {ConsumerGroupService} from './consumer-group.service';
import {from, Observable, of} from 'rxjs';
import {demoConsumerGroup} from './consumer-group.demo.data';
import {ConsumerGroupResponse} from '@app/common-model';
import {ConsumerGroupResetOffset} from './consumer-group-reset-offset.model';

@Injectable()
export class ConsumerGroupDemoService implements ConsumerGroupService {
  getConsumerGroup$(
    _serverId: string,
    groupId: string
  ): Observable<ConsumerGroupResponse> {
    return from([{consumerGroupOffset: demoConsumerGroup[groupId]}]);
  }

  resetOffset$(_data: ConsumerGroupResetOffset): Observable<void> {
    return of();
  }
}
