import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {TopicData} from './topic-data';
import {TopicService} from './topic.service';

@Injectable({
  providedIn: 'root'
})
export class TopicBackendService implements TopicService {

  constructor(private http: HttpClient) {
  }


  createTopic$(topicData: TopicData, serverId: string): Observable<void> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.post<void>(`/api/topic/create`, topicData, {params});
  }

  updateTopic$(topicData: TopicData, serverId: string): Observable<void> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.put<void>(`/api/topic/partitions/update`, topicData, {params});
  }

  getTopic$(serverId: string, topicName: string): Observable<TopicData> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.get<TopicData>(`/api/topic/${topicName}`, {params});
  }

  deleteSchema$(topicName: string, serverId: string): Observable<void> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.delete<void>(`/api/topic/${topicName}`, {params});
  }

}
