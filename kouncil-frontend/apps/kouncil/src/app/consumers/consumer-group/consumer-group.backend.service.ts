import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ConsumerGroupService} from './consumer-group.service';
import {Observable} from 'rxjs';
import {ConsumerGroupResponse} from '@app/common-model';

@Injectable({
  providedIn: 'root'
})
export class ConsumerGroupBackendService implements ConsumerGroupService {

  constructor(private http: HttpClient) {
  }

  getConsumerGroup$(serverId: string, groupId: string): Observable<ConsumerGroupResponse> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.get<ConsumerGroupResponse>(`/api/consumer-group/${groupId}`, {params});
  }
}
