import {Injectable} from '@angular/core';
import {Message} from '../topic/message';

@Injectable({
  providedIn: 'root'
})
export abstract class TrackService {

  protected constructor() {
  }

  abstract getEvents(): Message[];

  abstract getSearchableTopics(): string[];

}
