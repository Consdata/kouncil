import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsumerGroupsResponse } from './consumer-groups';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ConsumerGroupsBackendService } from './consumer-groups.backend.service';
import { ConsumerGroupsDemoService } from './consumer-groups.demo.service';
import {Backend} from '@app/common-model';

@Injectable()
export abstract class ConsumerGroupsService {
  abstract getConsumerGroups$(
    serverId: string
  ): Observable<ConsumerGroupsResponse>;

  abstract deleteConsumerGroup$(
    serverId: string,
    value: string
  ): Observable<Record<string, unknown>>;
}

export function consumerGroupsServiceFactory(
  http: HttpClient
): ConsumerGroupsService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ConsumerGroupsBackendService(http);
    }
    case Backend.DEMO: {
      return new ConsumerGroupsDemoService();
    }
  }
}
