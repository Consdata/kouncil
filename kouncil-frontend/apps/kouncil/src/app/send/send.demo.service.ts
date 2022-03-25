import { Injectable } from '@angular/core';
import { SendService } from './send.service';
import { from, Observable } from 'rxjs';
import {MessageData} from '@app/message-data';

@Injectable()
export class SendDemoService implements SendService {
  send$(_serverId: string, _count: number, _messageData: MessageData): Observable<Record<string, unknown>> {
    return from([{}]);
  }
}
