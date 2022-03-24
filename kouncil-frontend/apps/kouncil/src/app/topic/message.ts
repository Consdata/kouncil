import {MessageHeader} from './message-header';

export class Message {
   constructor(public key: string,
               public value: string,
               public offset: number | null,
               public partition: number | null,
               public timestamp: number | null,
               public headers: MessageHeader[],
               public topic: string) {

   }
}
