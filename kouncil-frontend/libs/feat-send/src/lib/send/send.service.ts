import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {MessageData} from '@app/message-data';

@Injectable()
export abstract class SendService {
  abstract send$(serverId: string, count: number, message: MessageData): Observable<Record<string, unknown>>;
}


