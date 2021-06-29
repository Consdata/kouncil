import {Injectable} from '@angular/core';
import {TopicMetadata} from '../topics/topics';
import {TrackService} from './track.service';
import {HttpClient} from '@angular/common/http';
import {Message} from '../topic/message';

@Injectable({
  providedIn: 'root'
})
export class TrackBackendService extends TrackService {

  constructor(private http: HttpClient) {
    super();
  }

  getEvents(): Message[] {
    return [];
  }

  getSearchableTopics(): string[] {
    return [];
  }
}
