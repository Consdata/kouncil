import {Injectable} from '@angular/core';
import {BrokerService} from './broker.service';
import {Observable} from 'rxjs';
import {BrokerConfig} from './broker';
import {Brokers} from './brokers';
import {HttpClient, HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrokerBackendService implements BrokerService {

  constructor(private http: HttpClient) { }

  getBrokerConfig$(serverId: string, id: string): Observable<BrokerConfig[]> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.get<BrokerConfig[]>(`/api/configs/${id}`, {params});
  }

  getBrokers$(serverId: string): Observable<Brokers> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.get<Brokers>(`/api/brokers`, {params});
  }
}
