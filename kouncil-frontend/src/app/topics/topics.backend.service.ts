import {Injectable} from '@angular/core';
import {TopicsService} from './topics.service';
import {Topics} from './topics';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TopicsBackendService implements TopicsService {

  constructor(private http: HttpClient) {
  }

  getTopics(): Observable<Topics> {
    return this.http.get<Topics>('/api/topics');
  }

}
