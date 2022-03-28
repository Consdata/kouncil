import {MessageData} from '@app/message-data';

export class TopicMessages {
  constructor(public messages: MessageData[],
              public partitionOffsets: { [key: number]: number },
              public partitionEndOffsets: { [key: number]: number },
              public totalResults: number) {

  }
}
