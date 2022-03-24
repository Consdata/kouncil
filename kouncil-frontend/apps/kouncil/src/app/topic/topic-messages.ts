import {Message} from './message';

export class TopicMessages {
  constructor(public messages: Message[],
              public partitionOffsets: { [key: number]: number },
              public partitionEndOffsets: { [key: number]: number },
              public totalResults: number) {

  }
}
