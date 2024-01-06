import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TopicData} from "@app/feat-topics";

@Injectable()
export abstract class TopicService {

  abstract createTopic$(topicData: TopicData, serverId: string): Observable<void>;

  abstract updateTopic$(topic: TopicData, selectedServerId: string): Observable<void>;

  abstract getTopic$(selectedServerId: string, topicName: string): Observable<TopicData>;

  abstract deleteSchema(topicName: string, selectedServerId: string): Observable<void>;
}
