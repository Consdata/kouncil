import { Injectable } from '@angular/core';
import {BrokerService} from './broker.service';
import {Observable} from 'rxjs';
import {BrokerConfig} from './broker';
import {Brokers} from './brokers';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrokerBackendService implements BrokerService {

  constructor(private http: HttpClient) { }

  getBrokerConfig(serverId: string, id: string): Observable<BrokerConfig[]> {
    return this.http.get<BrokerConfig[]>(`/api/configs/${id}?serverId=${serverId}`);
  }

  getBrokers(serverId: string): Observable<Brokers> {
    return this.http.get<Brokers>(`/api/brokers?serverId=${serverId}`);
  }
}
