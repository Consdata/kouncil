import { Injectable } from '@angular/core';
import { TopicsService } from './topics.service';
import { from, Observable } from 'rxjs';
import { Topics } from './topics';
import { demoTopics } from './topics.demo.data';

@Injectable({
  providedIn: 'root',
})
export class TopicsDemoService implements TopicsService {
  getTopics(): Observable<Topics> {
    return from([{ topics: demoTopics }]);
  }
}
