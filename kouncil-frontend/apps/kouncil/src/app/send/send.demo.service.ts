import { Injectable } from '@angular/core';
import { SendService } from './send.service';
import { from, Observable } from 'rxjs';
import { Message } from '../topic/message';

@Injectable()
export class SendDemoService implements SendService {
  send$(
    _serverId: string,
    _topic: string,
    _count: number,
    _message: Message
  ): Observable<Record<string, unknown>> {
    return from([{}]);
  }
}
