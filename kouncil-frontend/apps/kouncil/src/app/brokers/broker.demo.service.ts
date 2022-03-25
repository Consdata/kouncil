import { Injectable } from '@angular/core';
import { BrokerService } from './broker.service';
import { from, Observable } from 'rxjs';
import { BrokerConfig } from './broker';
import { Brokers } from './brokers';
import { demoBrokerConfig, demoBrokers } from './broker.demo.data';

@Injectable()
export class BrokerDemoService implements BrokerService {
  getBrokerConfig$(_id: string): Observable<BrokerConfig[]> {
    const brokerConfig: BrokerConfig[][] = [];
    brokerConfig.push(demoBrokerConfig);
    return from(brokerConfig);
  }

  getBrokers$(): Observable<Brokers> {
    return from([{ brokers: demoBrokers }]);
  }
}
