import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {demoTopics} from './topics.demo.data';
import {Topics} from '@app/common-model';
import {TopicsService} from "../topics.service";

@Injectable({
  providedIn: 'root',
})
export class TopicsDemoService implements TopicsService {
  getTopics$(): Observable<Topics> {
    return from([{topics: demoTopics}]);
  }
}
