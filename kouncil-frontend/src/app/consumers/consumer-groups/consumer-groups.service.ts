import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ConsumerGroupsResponse} from './consumer-groups';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Backend} from '../../app.backend';
import {ConsumerGroupsBackendService} from './consumer-groups.backend.service';
import {ConsumerGroupsDemoService} from './consumer-groups.demo.service';

@Injectable({
  providedIn: 'root'
})
export class ConsumerGroupsService {

  constructor() {
  }

  getConsumerGroups(serverId: string): Observable<ConsumerGroupsResponse> {
    return null;
  }

  deleteConsumerGroup(serverId: string, value: string): Observable<Object> {
    return null;
  }
}

export function consumerGroupsServiceFactory(http: HttpClient): ConsumerGroupsService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ConsumerGroupsBackendService(http);
    }
    case Backend.DEMO: {
      return new ConsumerGroupsDemoService();
    }
  }
}
