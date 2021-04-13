import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConsumerGroupService} from './consumer-group.service';
import {Observable} from 'rxjs';
import {ConsumerGroupResponse} from './consumer-group';

@Injectable({
  providedIn: 'root'
})
export class ConsumerGroupBackendService implements ConsumerGroupService {

  constructor(private http: HttpClient) {
  }

  getConsumerGroup(groupId: string): Observable<ConsumerGroupResponse> {
    return this.http.get<ConsumerGroupResponse>('/api/consumer-group/' + groupId);
  }
}
