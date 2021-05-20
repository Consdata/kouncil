import {Brokers} from './brokers';
import {Observable} from 'rxjs';
import {BrokerConfig} from './broker';
import {HttpClient} from '@angular/common/http';
import {BrokerBackendService} from './broker.backend.service';
import {BrokerDemoService} from './broker.demo.service';
import {environment} from '../../environments/environment';
import {Backend} from '../app.backend';

export class BrokerService {

  getBrokers(serverId: string): Observable<Brokers> {
    return undefined;
  }

  getBrokerConfig(serverId: string, id: string): Observable<BrokerConfig[]> {
    return undefined;
  }

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
