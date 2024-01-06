import {Injectable} from '@angular/core';
import {TopicService} from "./topic.service";
import {TopicData} from "./topic-data";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class TopicDemoService implements TopicService {
  createTopic$(topicData: TopicData, serverId: string): Observable<void> {
    return of();
  }

  deleteSchema(topicName: string, selectedServerId: string): Observable<void> {
    return of();
  }

  getTopic$(selectedServerId: string, topicName: string): Observable<TopicData> {
    return of(new TopicData());
  }

  updateTopic$(topic: TopicData, selectedServerId: string): Observable<void> {
    return of();
  }
}
