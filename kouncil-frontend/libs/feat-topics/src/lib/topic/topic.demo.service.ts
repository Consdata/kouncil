import {Injectable} from '@angular/core';
import {TopicService} from './topic.service';
import {TopicData} from './topic-data';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TopicDemoService implements TopicService {
  createTopic$(_topicData: TopicData, _serverId: string): Observable<void> {
    return of();
  }

  deleteSchema$(_topicName: string, _selectedServerId: string): Observable<void> {
    return of();
  }

  getTopic$(_selectedServerId: string, _topicName: string): Observable<TopicData> {
    return of(new TopicData());
  }

  updateTopic$(_topic: TopicData, _selectedServerId: string): Observable<void> {
    return of();
  }
}
