import { Injectable } from '@angular/core';
import {ConsumerGroupsService} from './consumer-groups.service';
import {from, Observable} from 'rxjs';
import {ConsumerGroupsResponse} from './consumer-groups';
import {demoConsumerGroups} from './consumer-groups.demo.data';

@Injectable({
  providedIn: 'root'
})
export class ConsumerGroupsDemoService implements ConsumerGroupsService {

  constructor() { }

  deleteConsumerGroup(value: string): Observable<Object> {
    demoConsumerGroups.forEach((consumerGroup, index) => {
      if (consumerGroup.groupId === value) {
        demoConsumerGroups.splice(index, 1);
      }
    });
    return from([{}]);
  }

  getConsumerGroups(): Observable<ConsumerGroupsResponse> {
    const consumerGroupsResponse = new ConsumerGroupsResponse();
    consumerGroupsResponse.consumerGroups = demoConsumerGroups;
    return from([consumerGroupsResponse]);
  }
}
