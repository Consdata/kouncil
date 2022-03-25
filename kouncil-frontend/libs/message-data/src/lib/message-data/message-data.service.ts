import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {MessageData} from './message-data';

@Injectable({
  providedIn: 'root'
})
export class MessageDataService {
  private messageDataSub: Subject<MessageData> = new BehaviorSubject<MessageData>({} as MessageData);

  get messageData$(): Observable<MessageData> {
    return this.messageDataSub.asObservable();
  }

  setMessageData(messageData: MessageData): void {
    this.messageDataSub.next(messageData);
  }
}
