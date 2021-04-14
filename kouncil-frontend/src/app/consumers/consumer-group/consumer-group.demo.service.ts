import {Injectable} from '@angular/core';
import {ConsumerGroupService} from './consumer-group.service';
import {from, Observable} from 'rxjs';
import {ConsumerGroupResponse} from './consumer-group';
import {demoConsumerGroup} from './consumer-group.demo.data';

@Injectable({
  providedIn: 'root'
})
export class ConsumerGroupDemoService implements ConsumerGroupService {

  constructor() { }

  getConsumerGroup(groupId: string): Observable<ConsumerGroupResponse> {
    const consumerGroupResponse = new ConsumerGroupResponse();
    consumerGroupResponse.consumerGroupOffset = demoConsumerGroup[groupId];
    return from([consumerGroupResponse]);
  }
}
