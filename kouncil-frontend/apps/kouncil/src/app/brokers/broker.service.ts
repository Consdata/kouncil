import {Brokers} from './brokers';
import {Observable} from 'rxjs';
import {BrokerConfig} from './broker';
import {HttpClient} from '@angular/common/http';
import {BrokerBackendService} from './broker.backend.service';
import {BrokerDemoService} from './broker.demo.service';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {Backend} from '@app/common-model';

@Injectable()
export abstract class BrokerService {

  abstract getBrokers$(serverId: string): Observable<Brokers>;

  abstract getBrokerConfig$(serverId: string, id: string): Observable<BrokerConfig[]>;

}

export function brokerServiceFactory(http: HttpClient): BrokerService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new BrokerBackendService(http);
    }
    case Backend.DEMO: {
      return new BrokerDemoService();
    }
  }
}
