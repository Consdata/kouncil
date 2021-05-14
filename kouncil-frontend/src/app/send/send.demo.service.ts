import { Injectable } from '@angular/core';
import {SendService} from './send.service';
import {from, Observable} from 'rxjs';
import {Message} from '../topic/message';

@Injectable({
  providedIn: 'root'
})
export class SendDemoService implements SendService {

  constructor() { }

  send(serverId: string, topic: string, count: number, message: Message): Observable<Object> {
    return from([{}]);
  }
}
