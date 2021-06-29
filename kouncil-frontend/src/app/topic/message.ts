import {MessageHeader} from './message-header';

export class Message {
   constructor(public key: string,
               public value: string,
               public offset: number,
               public partition: number,
               public timestamp: number,
               public headers: MessageHeader[]) {

   }
}
