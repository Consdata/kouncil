import {Injectable} from '@angular/core';
import {BrokerService} from './broker.service';
import {from, Observable} from 'rxjs';
import {BrokerConfig} from './broker';
import {Brokers} from './brokers';
import {demoBrokerConfig, demoBrokers} from './broker.demo.data';

@Injectable({
  providedIn: 'root'
})
export class BrokerDemoService implements BrokerService {

  constructor() {
  }

  getBrokerConfig(id: string): Observable<BrokerConfig[]> {
    const brokerConfig: BrokerConfig[][] = [];
    brokerConfig.push(demoBrokerConfig);
    return from(brokerConfig);
  }

  getBrokers(): Observable<Brokers> {
    const brokers = new Brokers();
    brokers.brokers = demoBrokers;
    return from([brokers]);
  }
}
