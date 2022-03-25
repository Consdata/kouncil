import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConsumerGroupsService } from './consumer-groups.service';
import { Observable } from 'rxjs';
import { ConsumerGroupsResponse } from './consumer-groups';

@Injectable({
  providedIn: 'root',
})
export class ConsumerGroupsBackendService implements ConsumerGroupsService {
  constructor(private http: HttpClient) {}

  deleteConsumerGroup$(
    serverId: string,
    value: string
  ): Observable<Record<string, unknown>> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.delete<Record<string, unknown>>(
      `/api/consumer-group/${value}`,
      { params }
    );
  }

  getConsumerGroups$(serverId: string): Observable<ConsumerGroupsResponse> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.get<ConsumerGroupsResponse>(`/api/consumer-groups`, {
      params,
    });
  }
}
