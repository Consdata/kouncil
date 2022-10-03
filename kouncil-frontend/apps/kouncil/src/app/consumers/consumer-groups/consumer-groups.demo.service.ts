import {Injectable} from '@angular/core';
import {ConsumerGroupsService} from './consumer-groups.service';
import {from, Observable} from 'rxjs';
import {demoConsumerGroups} from './consumer-groups.demo.data';
import {ConsumerGroupsResponse} from '@app/common-model';

@Injectable()
export class ConsumerGroupsDemoService implements ConsumerGroupsService {
  deleteConsumerGroup$(value: string): Observable<Record<string, unknown>> {
    demoConsumerGroups.forEach((consumerGroup, index) => {
      if (consumerGroup.groupId === value) {
        demoConsumerGroups.splice(index, 1);
      }
    });
    return from([{}]);
  }

  getConsumerGroups$(): Observable<ConsumerGroupsResponse> {
    const consumerGroupsResponse = new ConsumerGroupsResponse();
    consumerGroupsResponse.consumerGroups = demoConsumerGroups;
    return from([consumerGroupsResponse]);
  }
}
